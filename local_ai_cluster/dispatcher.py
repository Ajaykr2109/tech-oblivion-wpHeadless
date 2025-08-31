#!/usr/bin/env python3
"""
AI Cluster Dispatcher - Central job scheduler and node manager
"""

import asyncio
import json
import logging
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable
import threading
import queue
import requests
import ipaddress
import socket
from urllib.parse import urljoin

from monitor import SystemMonitor
from prompts import PromptManager
from plugins.base import LanguagePlugin, VerifierPlugin
from utils import setup_logging, load_config, backup_file


class JobPriority(Enum):
    URGENT = 1
    NORMAL = 2
    BULK = 3


class JobStatus(Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"


@dataclass
class Job:
    id: str
    job_type: str  # 'refactor', 'lint', 'codegen', 'chat', 'doc_query'
    priority: JobPriority
    payload: Dict[str, Any]
    created_at: float = field(default_factory=time.time)
    started_at: Optional[float] = None
    completed_at: Optional[float] = None
    status: JobStatus = JobStatus.QUEUED
    assigned_node: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3


@dataclass
class Node:
    id: str
    name: str
    host: str
    port: int
    model: str
    gpu: str
    capabilities: List[str]
    max_concurrent: int
    priority_weight: int
    enabled: bool = True
    active_jobs: int = 0
    total_jobs: int = 0
    success_rate: float = 1.0
    avg_response_time: float = 0.0
    last_seen: float = field(default_factory=time.time)
    metrics: Dict[str, Any] = field(default_factory=dict)


class ClusterDispatcher:
    """Central dispatcher for the AI cluster"""
    
    def __init__(self, config_path: str = "config.json"):
        self.config = load_config(config_path)
        self.logger = setup_logging(self.config.get("logging", {}))
        
        # Core components
        self.nodes: Dict[str, Node] = {}
        self.job_queue = queue.PriorityQueue()
        self.active_jobs: Dict[str, Job] = {}
        self.completed_jobs: List[Job] = []
        self.failed_jobs: List[Job] = []
        
        # Thread management
        self.executor = ThreadPoolExecutor(max_workers=10)
        self.monitor = SystemMonitor(self.config.get("monitoring", {}))
        self.prompt_manager = PromptManager()
        
        # State management
        self.running = False
        self.stats = {
            "jobs_processed": 0,
            "jobs_failed": 0,
            "total_nodes": 0,
            "active_nodes": 0,
            "start_time": time.time()
        }
        
        self._init_nodes()
        self._start_monitoring()
    
    def _init_nodes(self):
        """Initialize nodes from config"""
        node_configs = self.config.get("nodes", {})
        for node_id, node_config in node_configs.items():
            if node_config.get("enabled", True):
                node = Node(
                    id=node_id,
                    name=node_config["name"],
                    host=node_config["host"],
                    port=node_config["port"],
                    model=node_config["model"],
                    gpu=node_config["gpu"],
                    capabilities=node_config["capabilities"],
                    max_concurrent=node_config["max_concurrent"],
                    priority_weight=node_config["priority_weight"]
                )
                self.nodes[node_id] = node
                self.logger.info(f"Initialized node: {node.name} ({node.host}:{node.port})")
    
    def _start_monitoring(self):
        """Start background monitoring threads"""
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        
        self.discovery_thread = threading.Thread(target=self._discovery_loop, daemon=True)
        self.discovery_thread.start()
    
    def _monitor_loop(self):
        """Background monitoring of nodes and system"""
        while True:
            try:
                for node_id, node in self.nodes.items():
                    if node.enabled:
                        metrics = self._get_node_metrics(node)
                        node.metrics = metrics
                        node.last_seen = time.time()
                
                # Update cluster stats
                self.stats["total_nodes"] = len(self.nodes)
                self.stats["active_nodes"] = sum(1 for n in self.nodes.values() if n.enabled)
                
                time.sleep(self.config.get("monitoring", {}).get("update_interval", 5))
            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {e}")
                time.sleep(5)
    
    def _discovery_loop(self):
        """Auto-discover new nodes on the network"""
        discovery_config = self.config.get("cluster", {}).get("discovery", {})
        if not discovery_config:
            return
        
        scan_range = discovery_config.get("scan_range", "192.168.1.0/24")
        ports = discovery_config.get("ports", [1234])
        timeout = discovery_config.get("timeout", 5)
        
        while True:
            try:
                self._scan_for_nodes(scan_range, ports, timeout)
                time.sleep(300)  # Scan every 5 minutes
            except Exception as e:
                self.logger.error(f"Error in discovery loop: {e}")
                time.sleep(60)
    
    def _scan_for_nodes(self, scan_range: str, ports: List[int], timeout: int):
        """Scan network range for new AI nodes"""
        try:
            network = ipaddress.ip_network(scan_range, strict=False)
            for ip in network.hosts():
                for port in ports:
                    try:
                        response = requests.get(
                            f"http://{ip}:{port}/v1/models",
                            timeout=timeout
                        )
                        if response.status_code == 200:
                            models = response.json()
                            if models and "data" in models:
                                self._register_discovered_node(str(ip), port, models)
                    except requests.exceptions.RequestException:
                        continue
        except Exception as e:
            self.logger.error(f"Error scanning network: {e}")
    
    def _register_discovered_node(self, host: str, port: int, models_info: Dict):
        """Register a newly discovered node"""
        node_id = f"discovered_{host}_{port}"
        if node_id not in self.nodes:
            # Extract model info
            model_name = "unknown"
            if models_info.get("data"):
                model_name = models_info["data"][0].get("id", "unknown")
            
            node = Node(
                id=node_id,
                name=f"Discovered-{host}",
                host=host,
                port=port,
                model=model_name,
                gpu="unknown",
                capabilities=["general"],
                max_concurrent=1,
                priority_weight=1
            )
            
            self.nodes[node_id] = node
            self.logger.info(f"Discovered new node: {host}:{port} with model {model_name}")
            
            # Benchmark the new node
            if self.config.get("cluster", {}).get("discovery", {}).get("benchmark_on_discovery"):
                self._benchmark_node(node)
    
    def _benchmark_node(self, node: Node):
        """Benchmark a node's performance"""
        try:
            start_time = time.time()
            response = self._send_request(node, {
                "model": node.model,
                "messages": [{"role": "user", "content": "Hello, world!"}],
                "max_tokens": 10
            })
            end_time = time.time()
            
            if response:
                node.avg_response_time = end_time - start_time
                self.logger.info(f"Benchmarked {node.name}: {node.avg_response_time:.2f}s response time")
        except Exception as e:
            self.logger.error(f"Error benchmarking node {node.name}: {e}")
    
    def _get_node_metrics(self, node: Node) -> Dict[str, Any]:
        """Get performance metrics for a node"""
        try:
            # Try to get health status
            response = requests.get(
                f"http://{node.host}:{node.port}/health",
                timeout=5
            )
            if response.status_code == 200:
                return response.json()
        except requests.exceptions.RequestException:
            pass
        
        # Return basic metrics
        return {
            "status": "online" if time.time() - node.last_seen < 30 else "offline",
            "active_jobs": node.active_jobs,
            "load": node.active_jobs / node.max_concurrent if node.max_concurrent > 0 else 0
        }
    
    def submit_job(self, job_type: str, payload: Dict[str, Any], priority: JobPriority = JobPriority.NORMAL) -> str:
        """Submit a new job to the cluster"""
        job_id = f"job_{int(time.time() * 1000)}_{len(self.active_jobs)}"
        
        job = Job(
            id=job_id,
            job_type=job_type,
            priority=priority,
            payload=payload,
            max_retries=self.config.get("cluster", {}).get("job_settings", {}).get("retry_attempts", 3)
        )
        
        # Priority queue uses tuple (priority_value, job)
        # Lower priority value = higher priority
        priority_value = priority.value
        self.job_queue.put((priority_value, time.time(), job))
        
        self.logger.info(f"Submitted job {job_id} with priority {priority.name}")
        return job_id
    
    def _select_best_node(self, job: Job) -> Optional[Node]:
        """Select the best node for a job based on capabilities and load"""
        available_nodes = [
            node for node in self.nodes.values()
            if node.enabled and node.active_jobs < node.max_concurrent
        ]
        
        if not available_nodes:
            return None
        
        # Score nodes based on multiple factors
        def score_node(node: Node) -> float:
            score = 0.0
            
            # Capability match
            job_requirements = job.payload.get("requirements", [])
            if any(req in node.capabilities for req in job_requirements):
                score += 10.0
            
            # Load factor (prefer less loaded nodes)
            load_factor = node.active_jobs / node.max_concurrent
            score += (1.0 - load_factor) * 5.0
            
            # Success rate
            score += node.success_rate * 3.0
            
            # Response time (prefer faster nodes)
            if node.avg_response_time > 0:
                score += max(0, 5.0 - node.avg_response_time)
            
            # Priority weight
            score += node.priority_weight
            
            return score
        
        # Select node with highest score
        best_node = max(available_nodes, key=score_node)
        return best_node
    
    def _execute_job(self, job: Job, node: Node):
        """Execute a job on a specific node"""
        try:
            job.status = JobStatus.RUNNING
            job.started_at = time.time()
            job.assigned_node = node.id
            node.active_jobs += 1
            
            self.logger.info(f"Executing job {job.id} on node {node.name}")
            
            # Build request based on job type
            if job.job_type == "chat":
                result = self._execute_chat_job(job, node)
            elif job.job_type == "refactor":
                result = self._execute_refactor_job(job, node)
            elif job.job_type == "lint":
                result = self._execute_lint_job(job, node)
            elif job.job_type == "codegen":
                result = self._execute_codegen_job(job, node)
            elif job.job_type == "doc_query":
                result = self._execute_doc_query_job(job, node)
            else:
                raise ValueError(f"Unknown job type: {job.job_type}")
            
            job.result = result
            job.status = JobStatus.COMPLETED
            job.completed_at = time.time()
            
            # Update node stats
            node.total_jobs += 1
            response_time = job.completed_at - job.started_at
            if node.avg_response_time == 0:
                node.avg_response_time = response_time
            else:
                node.avg_response_time = (node.avg_response_time + response_time) / 2
            
            self.stats["jobs_processed"] += 1
            self.completed_jobs.append(job)
            
            self.logger.info(f"Job {job.id} completed successfully in {response_time:.2f}s")
            
        except Exception as e:
            self.logger.error(f"Job {job.id} failed: {e}")
            job.error = str(e)
            job.status = JobStatus.FAILED
            job.completed_at = time.time()
            
            # Update failure stats
            self.stats["jobs_failed"] += 1
            self.failed_jobs.append(job)
            
            # Update node success rate
            if node.total_jobs > 0:
                node.success_rate = (node.total_jobs - len([j for j in self.failed_jobs if j.assigned_node == node.id])) / node.total_jobs
        
        finally:
            node.active_jobs = max(0, node.active_jobs - 1)
            if job.id in self.active_jobs:
                del self.active_jobs[job.id]
    
    def _execute_chat_job(self, job: Job, node: Node) -> Dict[str, Any]:
        """Execute a chat job"""
        messages = job.payload.get("messages", [])
        model = job.payload.get("model", node.model)
        
        request_data = {
            "model": model,
            "messages": messages,
            "stream": job.payload.get("stream", False),
            "temperature": job.payload.get("temperature", 0.7),
            "max_tokens": job.payload.get("max_tokens", 1000)
        }
        
        response = self._send_request(node, request_data, endpoint="/v1/chat/completions")
        return {"response": response, "node": node.name}
    
    def _execute_refactor_job(self, job: Job, node: Node) -> Dict[str, Any]:
        """Execute a code refactor job"""
        file_path = job.payload.get("file_path")
        language = job.payload.get("language")
        refactor_type = job.payload.get("refactor_type", "general")
        
        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Get appropriate prompt
        prompt = self.prompt_manager.get_refactor_prompt(language, refactor_type, content)
        
        messages = [{"role": "user", "content": prompt}]
        
        request_data = {
            "model": node.model,
            "messages": messages,
            "temperature": 0.1,  # Low temperature for consistency
            "max_tokens": 4000
        }
        
        response = self._send_request(node, request_data, endpoint="/v1/chat/completions")
        return {
            "original_content": content,
            "refactored_content": response.get("choices", [{}])[0].get("message", {}).get("content", ""),
            "file_path": file_path,
            "node": node.name
        }
    
    def _execute_lint_job(self, job: Job, node: Node) -> Dict[str, Any]:
        """Execute a lint/fix job"""
        # Similar to refactor but focused on linting issues
        return self._execute_refactor_job(job, node)
    
    def _execute_codegen_job(self, job: Job, node: Node) -> Dict[str, Any]:
        """Execute a code generation job"""
        description = job.payload.get("description")
        language = job.payload.get("language", "python")
        
        prompt = self.prompt_manager.get_codegen_prompt(language, description)
        
        messages = [{"role": "user", "content": prompt}]
        
        request_data = {
            "model": node.model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 2000
        }
        
        response = self._send_request(node, request_data, endpoint="/v1/chat/completions")
        return {
            "generated_code": response.get("choices", [{}])[0].get("message", {}).get("content", ""),
            "language": language,
            "description": description,
            "node": node.name
        }
    
    def _execute_doc_query_job(self, job: Job, node: Node) -> Dict[str, Any]:
        """Execute a documentation query job"""
        query = job.payload.get("query")
        context = job.payload.get("context", "")
        
        prompt = f"Answer this question about the codebase:\n\nQuestion: {query}\n\nContext:\n{context}"
        
        messages = [{"role": "user", "content": prompt}]
        
        request_data = {
            "model": node.model,
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 1000
        }
        
        response = self._send_request(node, request_data, endpoint="/v1/chat/completions")
        return {
            "answer": response.get("choices", [{}])[0].get("message", {}).get("content", ""),
            "query": query,
            "node": node.name
        }
    
    def _send_request(self, node: Node, data: Dict[str, Any], endpoint: str = "/v1/chat/completions") -> Dict[str, Any]:
        """Send a request to a node"""
        url = f"http://{node.host}:{node.port}{endpoint}"
        
        headers = {"Content-Type": "application/json"}
        
        # Add authentication if enabled
        if self.config.get("cluster", {}).get("security", {}).get("enable_auth"):
            api_key = self.config.get("cluster", {}).get("security", {}).get("api_key")
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"
        
        try:
            response = requests.post(url, json=data, headers=headers, timeout=60)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request to {node.name} failed: {e}")
    
    def start(self):
        """Start the dispatcher"""
        self.running = True
        self.logger.info("Starting AI Cluster Dispatcher")
        
        # Start job processing loop
        while self.running:
            try:
                # Get next job from queue (blocks with timeout)
                try:
                    priority_value, timestamp, job = self.job_queue.get(timeout=1.0)
                except queue.Empty:
                    continue
                
                # Find best node for job
                node = self._select_best_node(job)
                if node is None:
                    # No available nodes, put job back in queue
                    self.job_queue.put((priority_value, timestamp, job))
                    time.sleep(1)
                    continue
                
                # Add to active jobs
                self.active_jobs[job.id] = job
                
                # Execute job in thread pool
                self.executor.submit(self._execute_job, job, node)
                
            except KeyboardInterrupt:
                self.logger.info("Received shutdown signal")
                break
            except Exception as e:
                self.logger.error(f"Error in dispatcher loop: {e}")
                time.sleep(1)
    
    def stop(self):
        """Stop the dispatcher"""
        self.running = False
        self.executor.shutdown(wait=True)
        self.logger.info("AI Cluster Dispatcher stopped")
    
    def get_status(self) -> Dict[str, Any]:
        """Get cluster status"""
        return {
            "stats": self.stats,
            "nodes": {
                node_id: {
                    "name": node.name,
                    "status": "online" if node.enabled else "offline",
                    "active_jobs": node.active_jobs,
                    "total_jobs": node.total_jobs,
                    "success_rate": node.success_rate,
                    "avg_response_time": node.avg_response_time,
                    "metrics": node.metrics
                }
                for node_id, node in self.nodes.items()
            },
            "queued_jobs": self.job_queue.qsize(),
            "active_jobs": len(self.active_jobs),
            "completed_jobs": len(self.completed_jobs),
            "failed_jobs": len(self.failed_jobs)
        }


if __name__ == "__main__":
    import signal
    
    dispatcher = ClusterDispatcher()
    
    # Handle shutdown gracefully
    def signal_handler(sig, frame):
        dispatcher.stop()
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        dispatcher.start()
    except KeyboardInterrupt:
        dispatcher.stop()
