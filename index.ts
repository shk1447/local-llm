console.log("Hello, Local LLM!");

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { LocalIndex } from "vectra";

import { GemmaChatWrapper, getLlama, LlamaChatSession } from "node-llama-cpp";

const main = async () => {
  const index = new LocalIndex(path.join(__dirname, ".", "rag_db"));

  if (!(await index.isIndexCreated())) {
    await index.createIndex();
  }

  const items = await index.listItems();
  for (const item of items) {
    await index.deleteItem(item.id);
  }

  const llama = await getLlama();

  const model = await llama.loadModel({
    modelPath: path.join(
      __dirname,
      "./models/nomic-embed-text-v2-moe.Q4_K_M.gguf"
    ),
    useMlock: true,
  });

  const llmModel = await llama.loadModel({
    modelPath: path.join(__dirname, "./models/gemma-3-1B-it-QAT-Q4_0.gguf"),
    gpuLayers: "auto",
  });
  const llmContext = await llmModel.createContext();
  const wrapper = new GemmaChatWrapper();

  const session = new LlamaChatSession({
    contextSequence: llmContext.getSequence(),
    chatWrapper: wrapper,
  });

  const query = "안녕?";

  const template = `
Answer the question based on the context below.

Context:
${[].join("\n\n")}

Question:
${query}

Answer:
`;

  const abort = new AbortController();
  const response = await session.prompt(query, {
    onTextChunk(text) {
      console.log(text);
    },
    signal: abort.signal,
    temperature: 0.8,
    topK: 50,
    topP: 0.9,
  });

  console.log(response);
};

main();
