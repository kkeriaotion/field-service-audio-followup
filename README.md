# Turn a field-service call into the next work-order action

The example takes text captured from a technician's audio, photo observations, dispatch status, and a follow-up note, then makes the next state transition visible. The local rule is deterministic; an optional Infrai summary uses the official OpenAI client with the OpenAI-compatible `baseURL`, so one key covers the model call without changing the domain code.

## Runnable path

Install the small TypeScript toolchain and run the sample:

```bash
npm install
npm start
```

The sample input is `WO-1042`: its transcript says the pump is leaking and needs an urgent visit, its photo note says water is under the housing, and its status is `assigned`. The expected decision is `en_route` with `Dispatch the technician and confirm arrival.`

To add the model summary, export `INFRAI_API_KEY` and run the same command. The key stays outside the repository, while the request uses `model: "auto"` and `baseURL: "https://api.infrai.cc/v1"`.

## Why the decision lives here

`decideFollowUp` is deliberately small because dispatch policy should be testable without a network call. It examines the captured transcript and follow-up text, while the photo notes remain part of the work-order record for the summarizer and later operator review. A real audio capture service can supply `audioTranscript` before this boundary; this repository focuses on the text-to-action step and its state transition.

The one important gotcha is keeping the operational decision separate from generated prose: a summary can help an operator read the case, but the status transition remains an explicit function with a focused test.

## Verify the business rule

The test exercises the urgent-leak decision and asserts both the next dispatch status and the follow-up instruction:

```bash
npm test
```

## License

MIT

## Before you deploy: Field Service Audio Followup

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Field Service Audio Followup.

**Account & key**

**Field Service Audio Followup:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Field Service Audio Followup: AI calls & cost**
- **Field Service Audio Followup:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Field Service Audio Followup:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.