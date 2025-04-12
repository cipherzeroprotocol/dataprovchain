import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const ProvenanceGraph = ({ data, width = 800, height = 600 }) => {
  const svgRef = useRef(null);
  
  // Define node colors based on type
  const nodeColors = React.useMemo(() => ({
    dataset: '#3b82f6', // blue
    model: '#10b981',   // green
    user: '#6366f1',    // indigo
    application: '#f59e0b' // amber
  }), []);

  // Define link colors based on type
  const linkColors = React.useMemo(() => ({
    training: '#3b82f6',  // blue
    validation: '#8b5cf6', // purple
    inference: '#ec4899',  // pink
    derivation: '#f59e0b'  // amber
  }), []);

  useEffect(() => {
    if (!data || !data.nodes || !data.edges || data.nodes.length === 0) {
      return;
    }

    // Clear any existing SVG
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%');

    // Create simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.edges).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create a container for the graph
    const container = svg.append('g');

    // Add zoom behavior
    svg.call(d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      }));

    // Create links
    const link = container.append('g')
      .selectAll('line')
      .data(data.edges)
      .enter()
      .append('line')
      .attr('stroke', d => linkColors[d.type] || '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Create nodes
    const node = container.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', 25)
      .attr('fill', d => nodeColors[d.type] || '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add icons or text to nodes
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', 'white')
      .text(d => d.name.charAt(0));

    // Add labels
    node.append('text')
      .attr('dx', 30)
      .attr('dy', 4)
      .attr('fill', '#333')
      .text(d => d.name);

    // Add tooltips
    node.append('title')
      .text(d => `${d.name}\nType: ${d.type}\nCreator: ${d.creator}`);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, [data, width, height, nodeColors, linkColors]);

  return (
    <div className="w-full border rounded-lg overflow-hidden bg-white">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Provenance Graph</h3>
        <p className="text-sm text-gray-500">
          Visualization of dataset lineage and usage
        </p>
      </div>
      <div className="p-4">
        {data && data.nodes && data.nodes.length > 0 ? (
          <svg ref={svgRef} className="w-full" style={{ height: `${height}px` }}></svg>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="mt-2 text-gray-500">No provenance data available</p>
          </div>
        )}
      </div>
      <div className="p-4 border-t bg-gray-50">
        <div className="flex flex-wrap gap-4">
          {Object.entries(nodeColors).map(([type, color]) => (
            <div key={type} className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }}></div>
              <span className="text-sm capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

ProvenanceGraph.propTypes = {
  data: PropTypes.shape({
    nodes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      creator: PropTypes.string
    })),
    edges: PropTypes.arrayOf(PropTypes.shape({
      source: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired,
      type: PropTypes.string,
      timestamp: PropTypes.string
    }))
  }),
  width: PropTypes.number,
  height: PropTypes.number
};

export default ProvenanceGraph;
