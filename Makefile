setup:
	chmod +x ./scripts/setup.sh && ./scripts/setup.sh

dev:
	bun run dev

.PHONY: setup dev