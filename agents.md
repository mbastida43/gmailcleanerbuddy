
1. Single codebase tracked in version control.
2. Explicitly declare and isolate dependencies (no system-level packages).
3. Store all configurations and credentials exclusively in environment variables.
4. Treat backing services (databases, queues, caches) as attached resources.
5. Strictly separate build, release, and run stages.
6. Run the application as one or more stateless processes
7. Export services via port binding.
8. Scale out via the process model (concurrency).
9. Maximize robustness with fast startup and graceful shutdown (disposability).
10. Keep development, staging, and production as similar as possible.11. Treat logs as event streams (write to stdout).12. Run admin/management tasks as one-off processes.
