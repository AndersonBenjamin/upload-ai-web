import { FileVideo, Upload } from "lucide-react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { fetchFile } from '@ffmpeg/util'
import { getFFmpeg } from "@/lib/ffmpeg";
import { api } from "@/lib/axios";

export function VideoInputForm() {

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const promptInputRef = useRef<HTMLTextAreaElement>(null)

    function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
        const { files } = event.currentTarget

        if (!files) {
            return
        }
        
        const selectedFile = files[0]

        setVideoFile(selectedFile)
    }

    async function convertVideoToAudio(video: File) {
        console.log('Convert started.')

        const ffmepeg = await getFFmpeg()

        await ffmepeg.writeFile('input.mp4', await fetchFile(video))

        //ffmepeg.on('log', log => {
        //   console.log(log)
        //})

        ffmepeg.on('progress', progress => {
            console.log('Convert progess: ' + Math.round(progress.progress * 100))
        })

        await ffmepeg.exec([
            '-i',
            'input.mp4',
            '-map',
            '0:a',
            //'-b:a',
            //'-20k',
            //'-acodec',
            //'libmp3lame',
            'output.mp3',
        ])

        const data = await ffmepeg.readFile('output.mp3')

        const audioFileBlob = new Blob([data], {type: 'audio/mpeg'})

        const audioFile = new File([audioFileBlob], 'audio.mp3', {
            type: 'audio/mpeg',
        })

        console.log('Convert finished.')

        return audioFile
    }

    async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

       const prompt = promptInputRef.current?.value

        if (!videoFile) {
            return
        }
        
        // converter o video em audio
        const audioFile = await convertVideoToAudio(videoFile)

        console.log(audioFile,prompt)

        const data = new FormData()

        data.append('file', audioFile)

        const response = await api.post('/videos', data)

        console.log(response.data);

        const videoId = response.data.video.id

        await api.post('/videos/6231efeb-4273-463a-9e0e-aa06c0f627f5/transcription', {
            prompt,
        })
        
        console.log('Finalizou')

    } 

    const previewURL = useMemo(() => {
        if (!videoFile) {
            return null
        } 
        return URL.createObjectURL(videoFile)
    }, [videoFile])
    return (
        <form onSubmit={handleUploadVideo} className="space-y-6">
            <label 
                htmlFor="video"
                className='relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5'>
            
                {previewURL ? (
                    <video src={previewURL} controls={false} className="pointer-events-none absolute inset-0" />
                ) : (
                    <>
                        <FileVideo className='w-4 h-4' />
                         Selecione um video
                    </>
                )}
            </label>
            <input type="file" id='video' accept='video/mp4' className='sr-only' onChange={handleFileSelect} />

            <Separator />

            <div className='space-y-2'>
                <Label htmlFor='transcription_prompt'>Prompt de Transcrição</Label>
                <Textarea 
                    ref={promptInputRef}
                    id='transcription_prompt'
                    className='h-20 leading-relaxed'
                    placeholder='Inclua palavras-chave no video, separadas por virgula' />
            </div>
            <Button type='submit' className='w-full' >
                Carregar video
                <Upload className='w-4 h-4 nl-2' />
            </Button>

        </form>
    )

}

