import logo from "./logo.svg"
import "./App.css"
import TirithPolicyBuilder from "./TirithPolicyBuilder"
import { useState } from "react"
import { useImmer } from "use-immer"

const defaultPolicy = {
  meta: {
    required_provider: "stackguardian/terraform_plan",
    version: "v1"
  },
  evaluators: [],
  eval_expression: "eval-id-1"
}

function App() {
  const [isTirithError, setIsTirithError] = useState(false)
  const [tirithPolicy, setTirithPolicy] = useImmer(defaultPolicy)

  return (
    <div className="App">
      <header className="App-header">
        <TirithPolicyBuilder setHasErrors={setIsTirithError} value={tirithPolicy} onChange={setTirithPolicy} shouldEnterPolicyName={false} />
      </header>
    </div>
  )
}

export default App
