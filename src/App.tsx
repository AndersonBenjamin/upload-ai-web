import { Github } from 'lucide-react'
import { Button } from "@/components/ui/button"


export function App() {
  return (
    <div  className="min-h-screen flex flex-col">
      <div className="px-6 py-3 flex items-certer justify-between border-b">
        <h1 className="text-xl font-bold">upload.ai</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Desenvolvido com amor
          </span>
          <Button variant="outline">
             <Github className= "w-4 h4 mr-2"></Github>
             Github
          </Button>
        </div>
      </div>
    </div>
  )
}


