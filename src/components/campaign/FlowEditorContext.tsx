import { createContext, useContext } from 'react'
import { Node, Edge } from 'reactflow'

interface FlowEditorContextType {
    selectedNode: Node | null
    setSelectedNode: (node: Node | null) => void
    selectedEdge: Edge | null
    setSelectedEdge: (edge: Edge | null) => void
    selectEdge: (edgeId: string) => void
}

export const FlowEditorContext = createContext<FlowEditorContextType>({
    selectedNode: null,
    setSelectedNode: () => { },
    selectedEdge: null,
    setSelectedEdge: () => { },
    selectEdge: () => { },
})

export const useFlowEditor = () => useContext(FlowEditorContext)
