// import fs from 'fs'
// import path from 'path'
// import { exec } from 'child_process'
// import axios from 'axios'
// // import FormData from 'form-data'

import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const config = new Configuration({
  apiKey: process.env.OPENAI_APIKEY,
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json()

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages
  })
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)
  // Respond with the stream
  return new StreamingTextResponse(stream)
}


// export async function POST(req) {
//   // const { prompt } = await req.json()
//   const response = await openai.createCompletion({
//     model: 'text-davinci-003',
//     stream: true,
//     temperature: 0.6,
//     prompt: 'What is Next.js?',
//   })

//   const stream = OpenAIStream(response)
//   return new StreamingTextResponse(stream)
// }

// import { cleanInput } from '../../../lib/utils'


// import { Configuration, OpenAIApi } from 'openai-edge'


// const config = new Configuration({
//   apiKey: process.env.OPENAI_APIKEY,
// })

// const openai = new OpenAIApi(config)

// export const runtime = 'edge'

// export async function POST(req) {

//   try {
//     const completion = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "You are a helpful assistant." },
//         { role: "user", content: "Who won the world series in 2020?" },
//         {
//           role: "assistant",
//           content: "The Los Angeles Dodgers won the World Series in 2020.",
//         },
//         { role: "user", content: "Where was it played?" },
//       ],
//       max_tokens: 7,
//       temperature: 0,
//       stream: true,
//     })

//     return new Response(completion.body, {
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Content-Type": "text/event-stream;charset=utf-8",
//         "Cache-Control": "no-cache, no-transform",
//         "X-Accel-Buffering": "no",
//       },
//     })
//   } catch (error) {
//     console.error(error)

//     return new Response(JSON.stringify(error), {
//       status: 400,
//       headers: {
//         "content-type": "application/json",
//       }
//     })
//   }
// }





//export async function POST(req) {

//    const form = await req.formData()

//    const blob = form.get('file')
//    const name = cleanInput(form.get('name'))
//    const models = cleanInput(form.get('model'))
//    const raw_options = cleanInput(form.get('options'))

//    /**
//     * Simple form validation
//     */
//    if(!blob || !name || !datetime) {
//        return new Response('Bad Request', {
//            status: 400,
//        })
//    }

//    const options = JSON.parse(raw_options)

//    const file = new Blob([blob], { type: 'video/mp4' });

//    // const buffer = Buffer.from( await blob.arrayBuffer() )
//    // const filename = `${name}.webm`
//    // let filepath = `${path.join('public', 'uploads', filename)}`

//    // fs.writeFileSync(filepath, buffer)

//    /**
//     * We are going to check the file size here to decide
//     * whether to send it or not to the API.
//     * As for the min file size value, it is based on my testing.
//     * There is probably a better way to check if the file has no audio data.
//     */
//    // const minFileSize = 18000 // bytes
//    // const stats = fs.statSync(filepath)

//    // if(parseInt(stats.size) < minFileSize) {

//    //     return new Response('Bad Request', {
//    //         status: 400,
//    //     })
//    // }

//    let header = {
//        'Content-Type': 'multipart/form-data',
//        'Accept': 'application/json',
//        'Authorization': `Bearer ${process.env.OPENAI_APIKEY}`
//    }

//    let formData = new FormData()
//    formData.append('file', file, 'test.webm')
//    formData.append('model', 'whisper-1')
//    formData.append('response_format', 'text') // e.g. text, vtt, srt

//    formData.append('temperature', options.temperature)
//    formData.append('language', options.language)

//    const url = options.endpoint === 'transcriptions' ? 'https://api.openai.com/v1/audio/transcriptions' : 'https://api.openai.com/v1/audio/translations'

//    let result = await new Promise((resolve, reject) => {

//        axios.post(url, formData, {
//            headers: {
//                ...header,
//            }
//        }).then((response) => {

//            resolve({
//                output: response.data,
//            })

//        }).catch((error) => {

//            reject(error) // Maybe rather than sending the whole error message, set some status value

//        })

//    })


//    const data = result?.output

//    /**
//     * Sample output
//     */
//    //const data = "WEBVTT\n\n00:00:00.000 --> 00:00:04.000\nThe party is starting now hurry up, let's go.\n00:00:04.000 --> 00:00:07.000\nHold this one, okay, do not drop it."

//    return new Response(JSON.stringify({
//        who: 'user',
//        datetime,
//        data,
//    }), {
//        status: 200,
//    })

//}
