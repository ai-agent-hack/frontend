setup:
	chmod +x ./scripts/setup.sh && ./scripts/setup.sh

dev:
	bun run dev

format:
	bun run format

.PHONY: setup dev