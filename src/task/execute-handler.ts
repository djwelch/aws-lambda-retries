interface Payload {
  value: boolean;
}

export async function handler(event: Payload) {
  console.log(JSON.stringify(event, null, 2));
  doSomething(event);
}

function doSomething(payload: Payload) {
  if (!payload.value) throw new Error("Value is false");
  console.log("value is true");
}
