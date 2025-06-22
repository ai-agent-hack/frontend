setup:
	chmod +x ./scripts/setup.sh && ./scripts/setup.sh

dev:
	bun run dev

format:
	bun run format

lint:
	bun run lint

mastra:
	bun run mastra

.PHONY: setup dev format lint mastra
