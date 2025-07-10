import { fileURLToPath } from "url";
import path from "path";
import { getLlama, LlamaChatSession, GemmaChatWrapper } from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const main = async () => {
  const llama = await getLlama({ vramPadding: 0 });
  llama.maxThreads = 0;

  const model = await llama.loadModel({
    modelPath: path.join(
      __dirname,
      "models",
      "gemma-2-2B-it-function-calling-Q8_0.gguf"
    ),
    gpuLayers: "auto",
    onLoadProgress(progress) {
      console.log(progress);
    },
  });
  const vram = await llama.getVramState();
  console.log((vram.used / vram.total) * 100);

  const context = await model.createContext({
    sequences: 1,
  });

  const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
    chatWrapper: new GemmaChatWrapper(),
  });
  const functions = {
    get_weather: {
      name: "get_weather",
      description: "A function that returns the weather in a given city.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city to get the weather for.",
          },
        },
        required: ["city"],
      },
    },
    get_sunrise_sunset_times: {
      name: "get_sunrise_sunset_times",
      description:
        "A function that returns the time of sunrise and sunset at the present moment, for a given city, in the form of a list: [sunrise_time, sunset_time].",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city to get the sunrise and sunset times for.",
          },
        },
        required: ["city"],
      },
    },
  };
  const q1 = `You are a helpful assistant with access to the following functions. Use them if required - ${Object.values(
    functions
  ).map((d) => JSON.stringify(d, null, 2))}`;
  // console.log("User: " + q1);

  const a1 = await session.prompt(q1);
  console.log("AI: " + a1);

  const q2 = `What's the weather in London?`;
  const a2 = await session.prompt(q2);
  console.log("AI: " + a2);
};

main();
