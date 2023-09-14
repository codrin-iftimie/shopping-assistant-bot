'use client'

import React from 'react'
import { createPortal } from 'react-dom'

import classes from './mainPage.module.css'

import { startStates } from './startbutton'

import ControlPanel from './controlPanel'
import Dialog from './dialog'
import SnackBar from './snackbar'
import AudioModal from './audiomodal'
import Modal from './modal'

import Transcript from './transcript'

import { useAppStore } from '../stores/appStore'
import { useAppData } from '../stores/appData'

import { useChat } from 'ai/react'

export default function MainPage() {

  const selectedVoice = useAppStore((state) => state.voice)
  const minDecibels = useAppStore((state) => state.threshold)
  const maxPause = useAppStore((state) => state.interval)
  const language = useAppStore((state) => state.language)
  const temperature = useAppStore((state) => state.temperature)
  const engine = useAppStore((state) => state.engine)
  const endpoint = useAppStore((state) => state.endpoint)

  // const initialSpeak = React.useRef()
  const listRef = React.useRef(null)
  const mediaRef = React.useRef()
  const chunksRef = React.useRef([])
  const animFrame = React.useRef()
  const timerCount = React.useRef()

  const abortControllerRef = React.useRef()

  // const [transcripts, setTranscripts] = React.useState([])
  const [sendCount, setSendCount] = React.useState(0)

  const videoRef = React.useRef(false)
  const startRef = React.useRef(startStates.default)
  const recordRef = React.useRef(false)
  const countDownRef = React.useRef(false)
  const countRef = React.useRef(0)
  const recordDateTime = React.useRef('')

  const [isReady, setReady] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')

  const [isRecording, setRecording] = React.useState(false)
  const [startState, setStartState] = React.useState(startStates.default)

  const [isCountDown, setCountDown] = React.useState(false)

  const [openSettings, setOpenSettings] = React.useState(false)
  const [openSnack, setOpenSnack] = React.useState(false)

  const [openAudioDialog, setOpenAudioDialog] = React.useState(false)
  const [audioFile, setAudioFile] = React.useState('')

  const [openModal, setOpenModal] = React.useState(false)

  const [isMounted, setMounted] = React.useState(false)


  React.useEffect(() => {

    abortControllerRef.current = new AbortController()
    setMounted(true)

    return () => {

      try {

        setMounted(false)

        if(abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

      } catch(err) {
        console.log(err)
      }

    }

  }, [])

  // React.useEffect(() => {


  //   setTimeout(() => {
  //     listRef.current.scrollTop = listRef.current.scrollHeight
  //   }, 900)

  // }, [nt, dataItems])

  // React.useEffect(() => {
  //   // console.log('ok effect')
  //   // if (window.speechSynthesis.getVoices().length > 0) {
  //   //   console.log('voices already loaded')
  //   //   speak(messages[1].content);
  //   // } else {
  //   window.speechSynthesis.onvoiceschanged = () => {
  //     console.log('voices were not ready')
  //     // handleStart();
  //     // speak when the voices are ready
  //     setTimeout( () => {
  //       speak(messages[1].content);
  //     }, 500)
  //   }
  //   // }
  // }, [])

  React.useEffect(() => {

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(handleStream).catch(handleError)

    } else {

      setErrorMessage('Media devices not supported')

    }

    return () => {

      try {

        window.cancelAnimationFrame(animFrame.current)

      } catch(error) {
        console.error(error)
      }

    }

  }, [])

  React.useEffect(() => {

    if(isCountDown) {

      timerCount.current = setInterval(() => {

        countRef.current += 100

      }, 100)

    }

    return () => {
      clearInterval(timerCount.current)
    }

  }, [isCountDown])

  const handleError = (error) => {
    console.log(error)
    setErrorMessage('Error calling getUserMedia')
  }

  const handleStream = (stream) => {

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    const audioStream = new MediaStream(stream.getAudioTracks())

    try {
      mediaRef.current = new MediaRecorder(audioStream, {
        audioBitsPerSecond: 128000,
        mimeType: 'audio/webm;codecs=opus',
      })

    } catch(error) {

      console.log(error)

      mediaRef.current = new MediaRecorder(stream, {
        audioBitsPerSecond: 128000,
      })

    }

    mediaRef.current.addEventListener('dataavailable', handleData)
    mediaRef.current.addEventListener("stop", handleStop)

    setReady(true)

    checkAudioLevel(stream)

    // And start the speech
    setTimeout( () => {
      speak(messages[1].content);
    }, 500)

  }

  const checkAudioLevel = (stream) => {

    const audioContext = new AudioContext()
    const audioStreamSource = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    analyser.maxDecibels = -10
    analyser.minDecibels = minDecibels
    audioStreamSource.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const domainData = new Uint8Array(bufferLength)

    const detectSound = () => {

      let soundDetected = false

      analyser.getByteFrequencyData(domainData)

      for (let i = 0; i < bufferLength; i++) {
        if (domainData[i] > 0) {
          soundDetected = true
        }
      }

      if(soundDetected === true) {

        if(recordRef.current) {

          if(countDownRef.current) {

            setCountDown(false)
            countDownRef.current = false
            countRef.current = 0

          }

        } else {

          if(startRef.current === startStates.active) {

            recordDateTime.current = (new Date()).toISOString()

            setRecording(true)
            recordRef.current = true

            setCountDown(false)
            countDownRef.current = false
            countRef.current = 0
            mediaRef.current.start()
          }

        }

      } else {

        if(recordRef.current) {

          if(countDownRef.current) {

            if(countRef.current >= maxPause) {

              if(startRef.current === startStates.active) {

                setRecording(false)
                recordRef.current = false

                setCountDown(false)
                countDownRef.current = false
                countRef.current = 0

                mediaRef.current.stop()

              }

            }

          } else {

            setCountDown(true)
            countDownRef.current = true
            countRef.current = 0

          }

        }

      }

      animFrame.current = window.requestAnimationFrame(detectSound)

    }

    animFrame.current = window.requestAnimationFrame(detectSound)

  }

  const handleData = (e) => {

    chunksRef.current.push(e.data)

  }

  const handleStop = () => {

    const blob = new Blob(chunksRef.current, {type: 'audio/webm;codecs=opus'})

    const datetime = recordDateTime.current
    const name = `file${Date.now()}` + Math.round(Math.random() * 100000)
    const file = new File([blob], `${name}.webm`)

    chunksRef.current = []

    setSendCount((prev) => prev + 1)

    sendData(name, datetime, file)

  }

  const sendData = async (name, datetime, file) => {

    let options = {
      language: language,
      endpoint: endpoint,
      temperature: temperature,
      engine: engine,
    }

    let formData = new FormData()
    formData.append('file', file, `${name}.webm`)
    formData.append('name', name)
    formData.append('datetime', datetime)
    formData.append('options', JSON.stringify(options))

    console.log("[send data]", (new Date()).toLocaleTimeString())

    try {

      const url = '/api/transcribe/'
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
        signal: abortControllerRef.current.signal,
      })

      if(!response.ok) {

        /**
         * I am assuming that all 500 errors will be caused by
         * problem in accessing the remote API endpoint for simplicity.
         */
        if(response.status === 500) {
          setOpenSnack(true)
        }

      }

      const result = await response.json()

      setSendCount((prev) => prev - 1)

      console.log("[received data]", (new Date()).toLocaleTimeString().toString())

      /**
       * verify if result does not contain any useful data, disregard
       */
      const data = result?.data
      if(data) {
        // addDataItems(result)
        appendMessage({
          role: 'user',
          content: data,
          createdAt: new Date(),
        })

        if(startRef.current === startStates.active) {
          // stop it!
          handleStart();
        }

      }


    } catch(err) {
      console.log(err)
      setSendCount((prev) => prev - 1)
    }

  }

  const handleStart = () => {

    if(startRef.current === startStates.default) {

      startRef.current = startStates.active

      setStartState(startStates.active)

    } else {

      if(mediaRef.current.state !== 'inactive') {
        mediaRef.current.stop()
      }

      setRecording(false)
      recordRef.current = false

      setCountDown(false)
      countDownRef.current = false
      countRef.current = 0

      startRef.current = startStates.default

      setStartState(startStates.default)

    }

  }

  const handleOpenSettings = () => {
    setOpenSettings(true)
  }

  const handleCloseSettings = () => {
    setOpenSettings(false)
  }

  const handleClickTranscript = async (file) => {
    /**
     * TODO: Play audio data
     */

    setAudioFile(file)
    setOpenAudioDialog(true)

  }

  const handleCloseSnack = () => {
    setOpenSnack(false)
  }

  const handleCloseAudio = () => {
    setOpenAudioDialog(false)
    setAudioFile('')
  }

  const handleDelete = (file) => {

    setAudioFile(file)
    setOpenModal(true)

  }

  const handleCloseModal = () => {

    setAudioFile('')
    setOpenModal(false)
  }

  const handleClickModal = () => {

    deleteDataItem(audioFile)

    setAudioFile('')
    setOpenModal(false)

  }

  const speak = (text) => {

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synth.getVoices()[selectedVoice];
    synth.speak(utterance);
    utterance.onstart = () => {
      if(startRef.current !== startStates.default) {
        handleStart();
      }
    }
    utterance.onend = () => {
      if(startRef.current === startStates.default) {
        handleStart();
      }
    }


  }



  const initialMessages = [{
    role: 'system',
    content: 'You are a shopping assistant that works for Macy\'s in a fictional store. Please help the customer have a good experience. Generate fake information as needed to the facade of being a good assistant. Limit responses to 25 words or less.',
    createdAt: new Date(),
  }, {
    role: 'assistant',
    content: "Hello, welcome to Macy's online shopping. I'm your virtual assistant, here to help you find the perfect items. You can ask me about specific products, request recommendations based on your preferences, or inquire about our latest deals and promotions. How can I assist you today?",
    id: 'initial',
    createdAt: new Date(),
  }];
  const { messages , append : appendMessage, input , handleInputChange , handleSubmit } = useChat({
    initialMessages,
    api : '/api/chat/',
    body : {
      engine
    },
    onResponse: (r) => {
      console.log('onresponse', r);
    },
    onFinish: (r) => {
      speak(r.content)
    }
  })

  console.log(messages);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <img height="70" src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Macy%27s_Logo_2019.png" />
        <div className={classes.headerText}>Smart Shopping Assistant</div>
      </div>
      <div className={classes.containerBody}>
        <div className={classes.videoBox}>
          <img src="https://www.w3schools.com//w3images/avatar_g2.jpg" alt="avatar" className={classes.avatar} />
          <video ref={videoRef} id="userVideo" width="100%" autoPlay muted></video>
        </div>
        <div ref={listRef} className={classes.main}>
          {
            !isReady &&
            <div className={classes.mainError}>
              <span className={classes.error}>{ errorMessage }</span>
            </div>
          }
          {
            (isMounted && isReady) &&
              <div className={classes.list}>
                {
                  messages.filter(m => m.role !== 'system').map(m => (
                    <Transcript key={m.id} {...m} />
                  ))
                }


                <form onSubmit={handleSubmit}>
                  <label>
                    Say something...
                    <input
                      className="fixed w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2"
                      value={input}
                      onChange={handleInputChange}
                    />
                  </label>
                  <button type="submit">Send</button>
                </form>
              </div>
          }
          <div className={classes.control}>
            <ControlPanel
            state={startState}
            isSignalOn={sendCount > 0}
            isRecording={isRecording}
            disabled={!isReady}
            disabledSetting={!isReady || startState === startStates.active}
            onStartClick={handleStart}
            onSettingsClick={handleOpenSettings}
          />
            </div>
          </div>
          {
            openSettings && createPortal(
              <Dialog onClose={handleCloseSettings} />,
              document.body,
            )
          }
          {
            openSnack && createPortal(
              <SnackBar onClose={handleCloseSnack} text="Problem sending the request to LocalAI Whisper API." />,
              document.body,
            )
          }
          {
            openAudioDialog && createPortal(
              <AudioModal file={audioFile} onClose={handleCloseAudio} />,
              document.body,
            )
          }
          {
            openModal && createPortal(
              <Modal text='Are you sure you want to delete this transcript?'
              buttonText='Delete' onButtonClick={handleClickModal} onCancel={handleCloseModal} />,
              document.body,
            )
          }
        </div>
      </div>
  )
}
