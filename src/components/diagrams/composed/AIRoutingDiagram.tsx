/**
 * AIRoutingDiagram — Architecture diagram for AI routing systems.
 *
 * Depicts LLM router, intent classification, response generation,
 * and fallback handling in a token-driven SVG skeleton.
 *
 * @module components/diagrams/composed/AIRoutingDiagram
 * Validates: Requirements 10.6
 */

import React from 'react';
import {
  DiagramCanvas,
  DiagramNode,
  DiagramEdge,
  DiagramCluster,
  DiagramLegend,
} from '../primitives';

export const AIRoutingDiagram: React.FC = () => {
  return (
    <DiagramCanvas
      title="AI Routing Architecture"
      description="Architecture diagram showing LLM router with intent classification, response generation pipelines, model selection, and fallback strategies."
      viewBox="0 0 800 520"
      aspectRatio={800 / 520}
    >
      {/* User input */}
      <DiagramNode
        variant="user"
        label="User Input"
        sublabel="Chat / API request"
        x={30}
        y={200}
        width={130}
        height={50}
      />

      {/* Router cluster */}
      <DiagramCluster
        label="AI Router"
        bounds={{ x: 200, y: 40, width: 380, height: 200 }}
        tone="primary"
      >
        <DiagramNode
          variant="service"
          label="Intent Classifier"
          sublabel="NLU pipeline"
          x={230}
          y={80}
          width={150}
          height={50}
        />
        <DiagramNode
          variant="service"
          label="Context Manager"
          sublabel="Session state"
          x={410}
          y={80}
          width={140}
          height={50}
        />
        <DiagramNode
          variant="lambda"
          label="Model Selector"
          sublabel="Cost / latency routing"
          x={310}
          y={160}
          width={150}
          height={50}
        />
      </DiagramCluster>

      {/* LLM providers */}
      <DiagramCluster
        label="LLM Providers"
        bounds={{ x: 200, y: 280, width: 380, height: 120 }}
        tone="secondary"
      >
        <DiagramNode
          variant="external"
          label="GPT-4"
          sublabel="Complex tasks"
          x={220}
          y={310}
          width={100}
          height={50}
        />
        <DiagramNode
          variant="external"
          label="Claude"
          sublabel="Analysis"
          x={340}
          y={310}
          width={100}
          height={50}
        />
        <DiagramNode
          variant="external"
          label="Mistral"
          sublabel="Fast inference"
          x={460}
          y={310}
          width={100}
          height={50}
        />
      </DiagramCluster>

      {/* Response generation */}
      <DiagramNode
        variant="service"
        label="Response Generator"
        sublabel="Streaming output"
        x={620}
        y={200}
        width={150}
        height={50}
      />

      {/* Fallback */}
      <DiagramNode
        variant="queue"
        label="Fallback Handler"
        sublabel="Retry / escalate"
        x={620}
        y={310}
        width={150}
        height={50}
      />

      {/* Cache */}
      <DiagramNode
        variant="datastore"
        label="Response Cache"
        sublabel="Redis / semantic"
        x={620}
        y={100}
        width={150}
        height={50}
      />

      {/* Edges: User → Router */}
      <DiagramEdge
        from={{ x: 160, y: 225 }}
        to={{ x: 230, y: 105 }}
        arrowhead="end"
        label="request"
      />

      {/* Edges: Classifier → Context */}
      <DiagramEdge
        from={{ x: 380, y: 105 }}
        to={{ x: 410, y: 105 }}
        arrowhead="end"
      />

      {/* Edges: Context → Model Selector */}
      <DiagramEdge
        from={{ x: 480, y: 130 }}
        to={{ x: 460, y: 175 }}
        arrowhead="end"
      />

      {/* Edges: Model Selector → LLMs */}
      <DiagramEdge
        from={{ x: 350, y: 210 }}
        to={{ x: 270, y: 310 }}
        arrowhead="end"
        style="dashed"
        label="route"
      />
      <DiagramEdge
        from={{ x: 385, y: 210 }}
        to={{ x: 390, y: 310 }}
        arrowhead="end"
        style="dashed"
      />
      <DiagramEdge
        from={{ x: 420, y: 210 }}
        to={{ x: 510, y: 310 }}
        arrowhead="end"
        style="dashed"
      />

      {/* Edges: LLMs → Response Generator */}
      <DiagramEdge
        from={{ x: 560, y: 335 }}
        to={{ x: 620, y: 225 }}
        arrowhead="end"
        animated
        label="completion"
      />

      {/* Edges: Response Generator → Cache */}
      <DiagramEdge
        from={{ x: 695, y: 200 }}
        to={{ x: 695, y: 150 }}
        arrowhead="end"
        style="dashed"
        label="cache"
      />

      {/* Edges: Fallback */}
      <DiagramEdge
        from={{ x: 695, y: 250 }}
        to={{ x: 695, y: 310 }}
        arrowhead="end"
        style="dashed"
        label="on error"
      />

      {/* Legend */}
      <g transform="translate(20, 400)">
        <DiagramLegend
          items={[
            { color: 'var(--color-accent-primary)', label: 'Service', shape: 'square' },
            { color: 'var(--color-accent-secondary)', label: 'External LLM', shape: 'circle' },
            { color: 'var(--color-warning)', label: 'Fallback', shape: 'diamond' },
            { color: 'var(--color-success)', label: 'Cache', shape: 'square' },
          ]}
          position="bottom-left"
        />
      </g>
    </DiagramCanvas>
  );
};

export default AIRoutingDiagram;
