# 🤖 LLM 추론(Inference) 방법 총정리

사전학습되거나 파인튜닝된 LLM 모델은 여러 환경에서 추론할 수 있습니다.  
아래는 대표적인 추론 방식과 각각의 특징입니다.

---

## 1. 🐍 Python (HuggingFace Transformers)

- 가장 기본적이고 유연한 방식
- 연구, 테스트, 튜닝에 적합

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained("gemma-2b-it")
model = AutoModelForCausalLM.from_pretrained("gemma-2b-it").to("cuda")

query = "한국의 수도는 어디인가요?"
inputs = tokenizer(query, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100)

print(tokenizer.decode(outputs[0]))
```

---

## 2. ⚙️ llama.cpp (C++ 또는 Python)

- `.gguf` 양자화 모델 실행
- CPU에서도 빠르고 경량, 모바일/로컬 실행에 적합

### CLI 예

```bash
./main -m gemma-3-1B-it-QAT-Q4_0.gguf -p "한국의 수도는?"
```

### Python 예 (`llama-cpp-python`)

```python
from llama_cpp import Llama

llm = Llama(model_path="gemma-3-1B-it-QAT-Q4_0.gguf")
output = llm("한국의 수도는 어디인가요?", max_tokens=64)
print(output["choices"][0]["text"])
```

---

## 3. 🧠 ONNX Runtime

- 모델을 ONNX로 변환해 추론 속도 최적화
- 경량 배포, 서버 사이드 추론에 적합

```python
import onnxruntime as ort

session = ort.InferenceSession("gemma.onnx")
outputs = session.run(None, {"input_ids": input_ids})
```

---

## 4. 🖥️ Web UI (ex. text-generation-webui, oobabooga)

- LLM을 GUI 환경에서 실행
- 개발자/비개발자 모두 쉽게 사용 가능

```bash
# 예: text-generation-webui 실행
python server.py --model gemma-3-1B-it-Q4_0.gguf
```

---

## 5. 🌐 FastAPI 또는 Flask 서버로 배포

- 웹 API 형태로 LLM을 제공
- 백엔드 서버와 통합 가능

```python
@app.post("/llm")
def infer(query: str):
    inputs = tokenizer(query, return_tensors="pt").to("cuda")
    outputs = model.generate(**inputs, max_new_tokens=128)
    return tokenizer.decode(outputs[0])
```

---

## 6. 🧩 LangChain / LlamaIndex 기반 RAG 시스템

- 검색 기반 응답 (Retrieval-Augmented Generation)
- Embedding + Vector DB + LLM 구조로 동작

```python
from langchain.chains import RetrievalQA

qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
qa.run("이 문서에 따르면 저자의 이름은?")
```

---

## 7. 📦 Node.js llama-cpp bindings

- Node.js 서버/웹환경에서 llama.cpp 사용 가능
- TypeScript 기반 서비스에 적합

```ts
import { LlamaModel, LlamaContext } from "node-llama-cpp";

const model = new LlamaModel({ modelPath: "gguf 파일 경로" });
const context = new LlamaContext({ model });
const response = context.prompt("대한민국의 수도는?", { maxTokens: 100 });
```

---

## ✅ 추론 방법 비교

| 방법          | 장점                   | 단점                | 용도           |
| ------------- | ---------------------- | ------------------- | -------------- |
| **Python**    | 코드 유연, 연구 개발   | 느림, 무겁다        | 학습, 테스트   |
| **llama.cpp** | 매우 빠름, 경량        | 기능 제한           | 데스크탑, 로컬 |
| **ONNX**      | 초고속 추론, 서버 배포 | 변환 필요           | 서비스 서빙    |
| **Web UI**    | 쉬운 사용, 직관적      | 커스터마이징 어려움 | 데모, 비개발자 |
| **FastAPI**   | API로 연동 가능        | 인프라 필요         | 백엔드 통합    |
| **LangChain** | 문서 검색 기반 LLM     | 구조 복잡           | RAG 시스템     |
| **Node.js**   | JS기반 앱에서 사용     | 리소스 제한         | 웹 앱 추론     |

---

## 🔗 추론 실습 리소스

| 항목              | 설명                              | 링크                                                             |
| ----------------- | --------------------------------- | ---------------------------------------------------------------- |
| 🧠 LLM 모델       | Gemma-3B Instruction 튜닝 (.gguf) | [다운로드](http://storage.vases.app/gemma-3-1B-it-QAT-Q4_0.gguf) |
| 🔎 Embedding 모델 | BGE-M3 q8_0 (.gguf)               | [다운로드](http://storage.vases.app/bge-m3-q8_0.gguf)            |

> nomic이 https://huggingface.co/nomic-ai/nomic-embed-text-v2-moe-GGUF

---

> 💡 학습은 Python + Transformers,  
> 실전 배포는 llama.cpp / ONNX / LangChain 등을 혼합해 사용합니다.
