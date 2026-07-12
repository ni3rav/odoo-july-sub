# Five-state trip lifecycle with InTransit

The PRD defines a four-state trip lifecycle (Draft → Dispatched → Completed → Cancelled). The mockup stepper adds an explicit `InTransit` stage between `Dispatched` and `Completed`. We adopt the five-state model: `Draft` → `Dispatched` → `InTransit` → `Completed`, with `Cancelled` reachable from `Dispatched` or `InTransit`. Dispatch sets vehicle and driver to `OnTrip`; completion (from `InTransit`) restores both to `Available`.
