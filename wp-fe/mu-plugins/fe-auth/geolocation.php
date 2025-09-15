<?php
/**
 * Enhanced Geolocation Service
 * Provides IP-based geolocation for country, city, and coordinates
 */

if (!defined('ABSPATH')) { exit; }

class FE_Geolocation_Service {
    
    private static $cache = [];
    
    /**
     * Get geolocation data for an IP address
     * @param string $ip_address The IP address to lookup
     * @return array Geolocation data including country, city, coordinates
     */
    public static function get_location_data($ip_address) {
        if (empty($ip_address) || $ip_address === '127.0.0.1' || $ip_address === '::1') {
            return self::get_default_location();
        }
        
        // Check cache first
        $cache_key = md5($ip_address);
        if (isset(self::$cache[$cache_key])) {
            return self::$cache[$cache_key];
        }
        
        $location_data = self::get_default_location();
        
        // Try multiple geolocation sources
        $sources = [
            'cloudflare' => function($ip) { return self::get_cloudflare_data($ip); },
            'ipapi' => function($ip) { return self::get_ipapi_data($ip); },
            'geoip2' => function($ip) { return self::get_geoip2_data($ip); },
            'freegeoip' => function($ip) { return self::get_freegeoip_data($ip); }
        ];
        
        foreach ($sources as $source => $callback) {
            try {
                $data = $callback($ip_address);
                if ($data && !empty($data['country_code'])) {
                    $location_data = array_merge($location_data, $data);
                    break; // Use the first successful result
                }
            } catch (Exception $e) {
                error_log("Geolocation error from {$source}: " . $e->getMessage());
            }
        }
        
        // Cache the result
        self::$cache[$cache_key] = $location_data;
        
        return $location_data;
    }
    
    /**
     * Get location from Cloudflare headers (if available)
     */
    private static function get_cloudflare_data($ip) {
        $data = self::get_default_location();
        
        // Cloudflare provides these headers
        if (isset($_SERVER['CF-IPCountry'])) {
            $data['country_code'] = substr($_SERVER['CF-IPCountry'], 0, 2);
        }
        
        if (isset($_SERVER['CF-IPCity'])) {
            $data['city_name'] = sanitize_text_field($_SERVER['CF-IPCity']);
        }
        
        if (isset($_SERVER['CF-Region'])) {
            $data['region_name'] = sanitize_text_field($_SERVER['CF-Region']);
        }
        
        if (isset($_SERVER['CF-Latitude'])) {
            $data['latitude'] = floatval($_SERVER['CF-Latitude']);
        }
        
        if (isset($_SERVER['CF-Longitude'])) {
            $data['longitude'] = floatval($_SERVER['CF-Longitude']);
        }
        
        return $data;
    }
    
    /**
     * Get location from IP-API.com (free, no key required)
     */
    private static function get_ipapi_data($ip) {
        $url = "http://ip-api.com/json/{$ip}?fields=status,country,countryCode,region,regionName,city,lat,lon";
        
        $response = wp_remote_get($url, [
            'timeout' => 5,
            'user-agent' => 'Tech-Oblivion Analytics/1.0'
        ]);
        
        if (is_wp_error($response)) {
            return null;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($data && $data['status'] === 'success') {
            return [
                'country_code' => $data['countryCode'] ?? null,
                'country_name' => $data['country'] ?? null,
                'city_name' => $data['city'] ?? null,
                'region_name' => $data['regionName'] ?? null,
                'latitude' => isset($data['lat']) ? floatval($data['lat']) : null,
                'longitude' => isset($data['lon']) ? floatval($data['lon']) : null,
            ];
        }
        
        return null;
    }
    
    /**
     * Get location from GeoIP2 (if MaxMind database is available)
     */
    private static function get_geoip2_data($ip) {
        // Check if GeoIP2 extension is available
        if (function_exists('geoip_record_by_name')) {
            try {
                $record = geoip_record_by_name($ip);
                if ($record) {
                    return [
                        'country_code' => $record['country_code'] ?? null,
                        'country_name' => $record['country_name'] ?? null,
                        'city_name' => $record['city'] ?? null,
                        'region_name' => $record['region'] ?? null,
                        'latitude' => isset($record['latitude']) ? floatval($record['latitude']) : null,
                        'longitude' => isset($record['longitude']) ? floatval($record['longitude']) : null,
                    ];
                }
            } catch (Exception $e) {
                error_log('GeoIP2 lookup failed: ' . $e->getMessage());
            }
        }
        
        return null;
    }
    
    /**
     * Get location from FreeGeoIP (backup service)
     */
    private static function get_freegeoip_data($ip) {
        $url = "https://freegeoip.app/json/{$ip}";
        
        $response = wp_remote_get($url, [
            'timeout' => 5,
            'user-agent' => 'Tech-Oblivion Analytics/1.0'
        ]);
        
        if (is_wp_error($response)) {
            return null;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($data && !empty($data['country_code'])) {
            return [
                'country_code' => $data['country_code'] ?? null,
                'country_name' => $data['country_name'] ?? null,
                'city_name' => $data['city'] ?? null,
                'region_name' => $data['region_name'] ?? null,
                'latitude' => isset($data['latitude']) ? floatval($data['latitude']) : null,
                'longitude' => isset($data['longitude']) ? floatval($data['longitude']) : null,
            ];
        }
        
        return null;
    }
    
    /**
     * Get default/fallback location data
     */
    private static function get_default_location() {
        return [
            'country_code' => null,
            'country_name' => null,
            'city_name' => null,
            'region_name' => null,
            'latitude' => null,
            'longitude' => null,
        ];
    }
    
    /**
     * Get client IP address with proxy detection
     */
    public static function get_client_ip() {
        $ip_keys = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_CLIENT_IP',            // Proxy
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'HTTP_X_REAL_IP',            // Nginx proxy
            'REMOTE_ADDR'                // Standard
        ];
        
        foreach ($ip_keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ips = explode(',', $_SERVER[$key]);
                $ip = trim($ips[0]);
                
                // Validate IP address
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        // Fallback to REMOTE_ADDR even if it's local
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }
}