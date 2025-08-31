#!/usr/bin/env python3
"""
System Monitor - Tracks performance metrics across the cluster
"""

import time
import threading
import psutil
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from collections import deque, defaultdict
import json

try:
    import GPUtil
    GPU_AVAILABLE = True
except ImportError:
    GPU_AVAILABLE = False
    logging.warning("GPUtil not available. GPU monitoring disabled.")

try:
    import pynvml
    NVIDIA_ML_AVAILABLE = True
    pynvml.nvmlInit()
except ImportError:
    NVIDIA_ML_AVAILABLE = False


@dataclass
class SystemMetrics:
    timestamp: float
    cpu_percent: float
    memory_percent: float
    disk_usage_percent: float
    network_bytes_sent: int
    network_bytes_recv: int
    gpu_metrics: List[Dict[str, Any]] = field(default_factory=list)
    process_count: int = 0
    load_average: List[float] = field(default_factory=list)


@dataclass
class NodeMetrics:
    node_id: str
    timestamp: float
    response_time: float
    tokens_per_second: float
    active_jobs: int
    queue_size: int
    memory_usage_mb: float
    cpu_percent: float
    gpu_utilization: float = 0.0
    gpu_memory_used: float = 0.0
    gpu_memory_total: float = 0.0
    model_name: str = ""
    status: str = "online"


class SystemMonitor:
    """Monitors system resources and performance metrics"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Metrics storage
        self.system_metrics_history = deque(maxlen=1000)
        self.node_metrics_history = defaultdict(lambda: deque(maxlen=1000))
        
        # Configuration
        self.update_interval = config.get("update_interval", 2)
        self.retention_hours = config.get("metrics_retention_hours", 24)
        self.enable_gpu = config.get("enable_gpu_monitoring", True)
        self.enable_bandwidth = config.get("enable_bandwidth_monitoring", True)
        
        # Alert thresholds
        self.alert_thresholds = config.get("alert_thresholds", {})
        
        # Runtime state
        self.running = False
        self.monitor_thread: Optional[threading.Thread] = None
        self.last_network_stats = None
        
        # GPU initialization
        self.gpu_available = GPU_AVAILABLE and self.enable_gpu
        self.nvidia_ml_available = NVIDIA_ML_AVAILABLE and self.enable_gpu
        
        if self.gpu_available:
            self.logger.info("GPU monitoring enabled")
        else:
            self.logger.info("GPU monitoring disabled")
    
    def start(self):
        """Start monitoring"""
        if self.running:
            return
        
        self.running = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        self.logger.info("System monitoring started")
    
    def stop(self):
        """Stop monitoring"""
        self.running = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        self.logger.info("System monitoring stopped")
    
    def _monitor_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                # Collect system metrics
                metrics = self._collect_system_metrics()
                self.system_metrics_history.append(metrics)
                
                # Check for alerts
                self._check_alerts(metrics)
                
                # Clean old metrics
                self._cleanup_old_metrics()
                
                time.sleep(self.update_interval)
                
            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {e}")
                time.sleep(self.update_interval)
    
    def _collect_system_metrics(self) -> SystemMetrics:
        """Collect current system metrics"""
        timestamp = time.time()
        
        # CPU and memory
        cpu_percent = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Network stats
        network_bytes_sent = 0
        network_bytes_recv = 0
        if self.enable_bandwidth:
            net_io = psutil.net_io_counters()
            if net_io:
                network_bytes_sent = net_io.bytes_sent
                network_bytes_recv = net_io.bytes_recv
        
        # Process count
        process_count = len(psutil.pids())
        
        # Load average (Unix-like systems)
        load_average = []
        try:
            load_average = list(psutil.getloadavg())
        except (AttributeError, OSError):
            # Windows doesn't have load average
            pass
        
        # GPU metrics
        gpu_metrics = []
        if self.gpu_available:
            gpu_metrics = self._collect_gpu_metrics()
        
        return SystemMetrics(
            timestamp=timestamp,
            cpu_percent=cpu_percent,
            memory_percent=memory.percent,
            disk_usage_percent=disk.percent,
            network_bytes_sent=network_bytes_sent,
            network_bytes_recv=network_bytes_recv,
            gpu_metrics=gpu_metrics,
            process_count=process_count,
            load_average=load_average
        )
    
    def _collect_gpu_metrics(self) -> List[Dict[str, Any]]:
        """Collect GPU metrics"""
        gpu_metrics = []
        
        if self.nvidia_ml_available:
            try:
                device_count = pynvml.nvmlDeviceGetCount()
                for i in range(device_count):
                    handle = pynvml.nvmlDeviceGetHandleByIndex(i)
                    
                    # GPU name
                    name = pynvml.nvmlDeviceGetName(handle).decode('utf-8')
                    
                    # Memory info
                    mem_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
                    
                    # Utilization
                    util = pynvml.nvmlDeviceGetUtilizationRates(handle)
                    
                    # Temperature
                    try:
                        temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
                    except pynvml.NVMLError:
                        temp = 0
                    
                    # Power usage
                    try:
                        power = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000.0  # Convert to watts
                    except pynvml.NVMLError:
                        power = 0
                    
                    gpu_metrics.append({
                        "index": i,
                        "name": name,
                        "memory_used": mem_info.used,
                        "memory_total": mem_info.total,
                        "memory_free": mem_info.free,
                        "memory_percent": (mem_info.used / mem_info.total) * 100,
                        "gpu_utilization": util.gpu,
                        "memory_utilization": util.memory,
                        "temperature": temp,
                        "power_usage": power
                    })
                    
            except pynvml.NVMLError as e:
                self.logger.error(f"NVIDIA-ML error: {e}")
        
        elif self.gpu_available:
            try:
                gpus = GPUtil.getGPUs()
                for i, gpu in enumerate(gpus):
                    gpu_metrics.append({
                        "index": i,
                        "name": gpu.name,
                        "memory_used": gpu.memoryUsed,
                        "memory_total": gpu.memoryTotal,
                        "memory_free": gpu.memoryFree,
                        "memory_percent": gpu.memoryUtil * 100,
                        "gpu_utilization": gpu.load * 100,
                        "temperature": gpu.temperature,
                        "power_usage": 0  # Not available in GPUtil
                    })
            except Exception as e:
                self.logger.error(f"GPUtil error: {e}")
        
        return gpu_metrics
    
    def _check_alerts(self, metrics: SystemMetrics):
        """Check metrics against alert thresholds"""
        alerts = []
        
        # CPU alert
        cpu_threshold = self.alert_thresholds.get("cpu_percent", 90)
        if metrics.cpu_percent > cpu_threshold:
            alerts.append(f"High CPU usage: {metrics.cpu_percent:.1f}%")
        
        # Memory alert
        memory_threshold = self.alert_thresholds.get("memory_percent", 85)
        if metrics.memory_percent > memory_threshold:
            alerts.append(f"High memory usage: {metrics.memory_percent:.1f}%")
        
        # GPU alerts
        gpu_memory_threshold = self.alert_thresholds.get("gpu_memory_percent", 90)
        for gpu in metrics.gpu_metrics:
            if gpu["memory_percent"] > gpu_memory_threshold:
                alerts.append(f"High GPU memory usage on {gpu['name']}: {gpu['memory_percent']:.1f}%")
        
        # Log alerts
        for alert in alerts:
            self.logger.warning(f"ALERT: {alert}")
    
    def _cleanup_old_metrics(self):
        """Remove metrics older than retention period"""
        cutoff_time = time.time() - (self.retention_hours * 3600)
        
        # Clean system metrics
        while (self.system_metrics_history and 
               self.system_metrics_history[0].timestamp < cutoff_time):
            self.system_metrics_history.popleft()
        
        # Clean node metrics
        for node_id in list(self.node_metrics_history.keys()):
            history = self.node_metrics_history[node_id]
            while history and history[0].timestamp < cutoff_time:
                history.popleft()
            
            # Remove empty histories
            if not history:
                del self.node_metrics_history[node_id]
    
    def record_node_metrics(self, node_metrics: NodeMetrics):
        """Record metrics for a specific node"""
        self.node_metrics_history[node_metrics.node_id].append(node_metrics)
    
    def get_current_system_metrics(self) -> Optional[SystemMetrics]:
        """Get the most recent system metrics"""
        if self.system_metrics_history:
            return self.system_metrics_history[-1]
        return None
    
    def get_system_metrics_history(self, hours: int = 1) -> List[SystemMetrics]:
        """Get system metrics history for the specified number of hours"""
        cutoff_time = time.time() - (hours * 3600)
        return [m for m in self.system_metrics_history if m.timestamp >= cutoff_time]
    
    def get_node_metrics_history(self, node_id: str, hours: int = 1) -> List[NodeMetrics]:
        """Get node metrics history for the specified number of hours"""
        cutoff_time = time.time() - (hours * 3600)
        history = self.node_metrics_history.get(node_id, [])
        return [m for m in history if m.timestamp >= cutoff_time]
    
    def get_cluster_summary(self) -> Dict[str, Any]:
        """Get a summary of cluster performance"""
        current_metrics = self.get_current_system_metrics()
        if not current_metrics:
            return {}
        
        # Calculate network throughput
        network_throughput = {"sent_mbps": 0, "recv_mbps": 0}
        if len(self.system_metrics_history) >= 2:
            prev_metrics = self.system_metrics_history[-2]
            time_diff = current_metrics.timestamp - prev_metrics.timestamp
            if time_diff > 0:
                sent_diff = current_metrics.network_bytes_sent - prev_metrics.network_bytes_sent
                recv_diff = current_metrics.network_bytes_recv - prev_metrics.network_bytes_recv
                
                network_throughput["sent_mbps"] = (sent_diff / time_diff) / (1024 * 1024)
                network_throughput["recv_mbps"] = (recv_diff / time_diff) / (1024 * 1024)
        
        # GPU summary
        gpu_summary = []
        for gpu in current_metrics.gpu_metrics:
            gpu_summary.append({
                "name": gpu["name"],
                "utilization": gpu["gpu_utilization"],
                "memory_percent": gpu["memory_percent"],
                "temperature": gpu["temperature"]
            })
        
        # Node summary
        node_summary = {}
        for node_id, history in self.node_metrics_history.items():
            if history:
                latest = history[-1]
                node_summary[node_id] = {
                    "status": latest.status,
                    "active_jobs": latest.active_jobs,
                    "queue_size": latest.queue_size,
                    "response_time": latest.response_time,
                    "tokens_per_second": latest.tokens_per_second,
                    "cpu_percent": latest.cpu_percent,
                    "gpu_utilization": latest.gpu_utilization
                }
        
        return {
            "timestamp": current_metrics.timestamp,
            "system": {
                "cpu_percent": current_metrics.cpu_percent,
                "memory_percent": current_metrics.memory_percent,
                "disk_usage_percent": current_metrics.disk_usage_percent,
                "process_count": current_metrics.process_count,
                "load_average": current_metrics.load_average
            },
            "network": network_throughput,
            "gpus": gpu_summary,
            "nodes": node_summary
        }
    
    def export_metrics(self, filename: str, format: str = "json", hours: int = 24):
        """Export metrics to file"""
        data = {
            "export_timestamp": time.time(),
            "hours": hours,
            "system_metrics": [],
            "node_metrics": {}
        }
        
        # Export system metrics
        system_history = self.get_system_metrics_history(hours)
        for metrics in system_history:
            data["system_metrics"].append({
                "timestamp": metrics.timestamp,
                "cpu_percent": metrics.cpu_percent,
                "memory_percent": metrics.memory_percent,
                "disk_usage_percent": metrics.disk_usage_percent,
                "network_bytes_sent": metrics.network_bytes_sent,
                "network_bytes_recv": metrics.network_bytes_recv,
                "gpu_metrics": metrics.gpu_metrics,
                "process_count": metrics.process_count,
                "load_average": metrics.load_average
            })
        
        # Export node metrics
        for node_id in self.node_metrics_history:
            node_history = self.get_node_metrics_history(node_id, hours)
            data["node_metrics"][node_id] = []
            for metrics in node_history:
                data["node_metrics"][node_id].append({
                    "timestamp": metrics.timestamp,
                    "response_time": metrics.response_time,
                    "tokens_per_second": metrics.tokens_per_second,
                    "active_jobs": metrics.active_jobs,
                    "queue_size": metrics.queue_size,
                    "memory_usage_mb": metrics.memory_usage_mb,
                    "cpu_percent": metrics.cpu_percent,
                    "gpu_utilization": metrics.gpu_utilization,
                    "gpu_memory_used": metrics.gpu_memory_used,
                    "gpu_memory_total": metrics.gpu_memory_total,
                    "model_name": metrics.model_name,
                    "status": metrics.status
                })
        
        # Write to file
        if format.lower() == "json":
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
        elif format.lower() == "csv":
            import csv
            # Export as CSV (simplified)
            with open(filename, 'w', newline='') as f:
                writer = csv.writer(f)
                
                # System metrics
                writer.writerow(["Type", "Timestamp", "Metric", "Value"])
                for metrics in system_history:
                    writer.writerow(["system", metrics.timestamp, "cpu_percent", metrics.cpu_percent])
                    writer.writerow(["system", metrics.timestamp, "memory_percent", metrics.memory_percent])
                    writer.writerow(["system", metrics.timestamp, "disk_usage_percent", metrics.disk_usage_percent])
        
        self.logger.info(f"Metrics exported to {filename}")
    
    def calculate_cluster_efficiency(self) -> Dict[str, float]:
        """Calculate cluster efficiency metrics"""
        if not self.node_metrics_history:
            return {}
        
        total_utilization = 0
        total_nodes = 0
        total_response_time = 0
        total_throughput = 0
        
        for node_id, history in self.node_metrics_history.items():
            if history:
                latest = history[-1]
                if latest.status == "online":
                    total_utilization += latest.gpu_utilization if latest.gpu_utilization > 0 else latest.cpu_percent
                    total_response_time += latest.response_time
                    total_throughput += latest.tokens_per_second
                    total_nodes += 1
        
        if total_nodes == 0:
            return {}
        
        return {
            "average_utilization": total_utilization / total_nodes,
            "average_response_time": total_response_time / total_nodes,
            "total_throughput": total_throughput,
            "efficiency_score": (total_throughput / max(total_response_time, 1)) * 100
        }


if __name__ == "__main__":
    # Test the monitor
    config = {
        "update_interval": 2,
        "metrics_retention_hours": 1,
        "enable_gpu_monitoring": True,
        "enable_bandwidth_monitoring": True,
        "alert_thresholds": {
            "cpu_percent": 80,
            "memory_percent": 80,
            "gpu_memory_percent": 85
        }
    }
    
    monitor = SystemMonitor(config)
    monitor.start()
    
    try:
        while True:
            summary = monitor.get_cluster_summary()
            print(f"Cluster Summary: {summary}")
            time.sleep(5)
    except KeyboardInterrupt:
        monitor.stop()
