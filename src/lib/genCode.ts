import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG,
})
const openai = new OpenAIApi(configuration)
const model = 'gpt-4'
// const model = 'gpt-3.5-turbo'

export async function generateVideoCode(
  messages: ChatCompletionRequestMessage[]
) {
  console.log(
    'Starting completion with messages: ',
    JSON.stringify(messages, null, 2)
  )
  const completion = await openai.createChatCompletion({
    model,
    messages,
    temperature: 0,
  })
  const content = completion.data.choices[0].message?.content

  const codeRegex = /```([\s\S]*?)```/g
  let code = content?.match(codeRegex)?.[0]
  // strip ``` from either side
  code = code?.substring(3, code.length - 3)

  return { code, content, model }
}
