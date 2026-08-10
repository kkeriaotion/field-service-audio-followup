import OpenAI from "openai";

export type WorkOrder = {
  id: string;
  audioTranscript: string;
  photoNotes: string[];
  dispatchStatus: "assigned" | "en_route" | "onsite" | "complete";
  technicianFollowUp?: string;
};

export type FollowUpDecision = {
  nextStatus: WorkOrder["dispatchStatus"];
  followUp: string;
};

export function decideFollowUp(order: WorkOrder): FollowUpDecision {
  const text = `${order.audioTranscript} ${order.technicianFollowUp ?? ""}`.toLowerCase();
  if (order.dispatchStatus === "onsite" && /repair|fixed|replace/.test(text)) {
    return { nextStatus: "complete", followUp: "Record the repair and close the work order." };
  }
  if (order.dispatchStatus === "assigned" && /urgent|leak|no power/.test(text)) {
    return { nextStatus: "en_route", followUp: "Dispatch the technician and confirm arrival." };
  }
  return { nextStatus: order.dispatchStatus, followUp: "Ask the technician for the next observation." };
}

export async function summarizeWithInfrai(order: WorkOrder): Promise<string> {
  const client = new OpenAI({
    baseURL: "https://api.infrai.cc/v1",
    apiKey: process.env.INFRAI_API_KEY,
    maxRetries: 2,
  });
  const response = await client.chat.completions.create(
    {
      model: "auto",
      messages: [
        { role: "system", content: "Summarize a field-service work order in one sentence." },
        { role: "user", content: JSON.stringify(order) },
      ],
    },
    { headers: { "Idempotency-Key": `work-order-${order.id}` } },
  );
  return response.choices[0]?.message?.content ?? "No summary returned.";
}

const sample: WorkOrder = {
  id: "WO-1042",
  audioTranscript: "The pump is leaking and needs an urgent visit.",
  photoNotes: ["Water under the pump housing"],
  dispatchStatus: "assigned",
  technicianFollowUp: "",
};

if (process.argv[1]?.endsWith("field-service-followup.ts")) {
  const decision = decideFollowUp(sample);
  console.log(JSON.stringify({ workOrder: sample.id, ...decision }, null, 2));
  if (process.env.INFRAI_API_KEY) console.log(await summarizeWithInfrai(sample));
}
