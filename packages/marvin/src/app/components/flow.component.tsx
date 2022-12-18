import React, { useEffect } from 'react';
import { Models } from '@marvin/discovery';

const flextree = require('d3-flextree').flextree;
const d3 = require('d3');

const padding = 20;
const cellPadding = 5;
const maxCellSize = 150;
const verticalSpacing = 20;
const font = '12px helvetica';

function wrap(text: any, width: number) {
  text.each(function (this: any) {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr('x'),
      y = text.attr('y'),
      dy = 0, 
      tspan = text
        .text(null)
        .append('tspan')
        .attr('x', x)
        .attr('y', y)
        .attr('dy', dy + 'em');
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text
          .append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}

const getTitleFromNode = (node: any) => { 
  return node.data.sequence_step
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FlowComponent({
  flowModel,
  config,
  saveFile,
}: {
  flowModel: Models.FlowModel;
  config: any;
  saveFile: Function
}) {
  const [tree, setTree] = React.useState<any>(null);
  const [svgWidth, setSvgWidth] = React.useState(0);
  const [svgHeight, setSvgHeight] = React.useState(0);
  const svgRef = React.useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const temp = svg.append('g');
    let a = 0;
    const layout = flextree({
      children: (d: any) => d.children,
      nodeSize: (n: any) => {
        temp.selectAll('text').remove();
        const text = temp
          .append('text')
          .text((d: any) => getTitleFromNode(n))
          .style('font', font)
          // .attr('text-anchor', 'middle')
          .call(wrap, maxCellSize);
        const boundingBox = text.node().getBBox();
        const { width, height } = boundingBox;
        console.log(boundingBox);
        return [width + cellPadding * 2, height + cellPadding * 2 + 20];
      },
      spacing: (a: any, b: any) => 20,
    });
    const tree = layout.hierarchy({
      sequence_step: config.name,
      children: flowModel.graph,
    });

    layout(tree);

    tree.each((node: any) => {
      node.y += node.depth * verticalSpacing;
    });

    const extents = tree.extents;

    const { top, bottom, left, right } = extents;

    const width = right - left + 2 * padding;
    const height = bottom - top + 2 * padding;
    const transX = width / 2;
    const g = svg
      .append('g')
      .attr('transform', `translate(${padding + transX} ${padding})`);

    console.log(tree);

    const nodes = tree.descendants();
    const links = tree.links();

    const node = g.selectAll('.node').data(nodes);

    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x - d.xSize / 2} ${d.y})`);

    nodeEnter
      .append('rect')
      .attr('width', (d: any) => d.xSize)
      .attr('height', (d: any) => d.ySize)
      .attr('fill', '#e9ddb7')
      .attr('stroke', '#e2b862')
      .attr('rx', 3)
      .attr('ry', 3);

    nodeEnter
      .append('text')
      .text((d: any) => getTitleFromNode(d))
      .style('font', font)
      .attr('x', (d: any) => d.xSize / 2)
      .attr('y', (d: any) => 17)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'hanging')
      .call(wrap, maxCellSize);

    setSvgWidth(width);
    setSvgHeight(height);
  }, [flowModel]);

  return <svg ref={svgRef} width={svgWidth} height={svgHeight}></svg>;
}

export default FlowComponent;
