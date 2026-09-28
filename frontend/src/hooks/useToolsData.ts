import { useEffect, useState } from 'react'
import { readTools, type ToolsData } from '../local/healthTools'

const EMPTY: ToolsData = { reminders: [], bp: [], glucose: [] }

function safeRead(): ToolsData {
  try {
    return readTools()
  } catch {
    return EMPTY
  }
}

export function useToolsData(): ToolsData {
  const [data, setData] = useState<ToolsData>(safeRead)

  useEffect(() => {
    const refresh = () => setData(safeRead())
    window.addEventListener('careguide:tools', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('careguide:tools', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return data
}
