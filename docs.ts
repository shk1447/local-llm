console.log("Hello, Local LLM!");

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { LocalIndex } from "vectra";

import { getLlama } from "node-llama-cpp";

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
  /*
  const documents = [
    "오늘은 날씨가 참 좋아서 외출하기에 아주 좋은 날이에요.",
    "책을 읽는 것은 마음을 편안하게 해주고 지식을 넓혀줍니다.",
    "나는 미래에 대한 두려움을 가지지 않고 미래를 기대하며 살고 있습니다.",
    "나는 어제보다 오늘 더 나은 내일을 만들기 위해 노력하고 있습니다.",
    "음악을 들으며 산책하는 것은 스트레스를 해소하는 데에 효과적입니다.",
    "요리를 하며 시간을 보내는 것은 나에게 큰 즐거움을 줍니다.",
    "새로운 언어를 배우는 것은 마음을 더 넓게 만들어 줍니다.",
    "Today, the weather is so nice that it's perfect for going out.",
    "Reading books relaxes the mind and broadens one's knowledge.",
    "Listening to music while walking is effective in relieving stress.",
    "Spending time cooking brings me great joy.",
    "Learning a new language opens up one's mind.",
  ];
*/

  const documents = [
    "오늘 하늘이 맑고 파랗다",
    "나는 치즈를 듬뿍 얹은 피자를 좋아한다",
    "강아지들은 주인과 함께 공 던지기 놀이를 좋아한다",
    "프랑스의 수도는 파리다",
    "물을 마시는 것은 수분을 유지하는 데 중요하다",
    "에베레스트 산은 세계에서 가장 높은 산이다",
    "추운 겨울날에 따뜻한 차 한 잔이 제격이다",
    "그림 그리기는 창의적 표현의 한 형태다",
    "반짝이는 모든 것이 금으로 만들어진 것은 아니다",
    "집을 청소하는 것은 집을 깔끔하게 유지하는 좋은 방법이다",
  ];

  const context = await model.createEmbeddingContext();

  for (const doc of documents) {
    const tokens = model.tokenize(doc);
    const embedding = await context.getEmbeddingFor(tokens);
    await index.insertItem({
      vector: [...embedding.vector],
      metadata: { text: doc },
    });
  }

  const query = "지구에서 가장 높은 산은 무엇인가요?";
  const queryEmbedding = await context.getEmbeddingFor(query);

  const results = await index.queryItems([...queryEmbedding.vector], "", 3);
  if (results.length > 0) {
    for (const result of results) {
      console.log(`[${result.score}] ${result.item.metadata.text}`);
    }
  } else {
    console.log(`No results found.`);
  }
};

main();
