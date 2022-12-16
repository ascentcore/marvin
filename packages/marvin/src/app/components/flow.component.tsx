import React, { useEffect } from 'react';
import { Models } from '@marvin/discovery';

const flextree = require('d3-flextree').flextree;
const d3 = require('d3');

const padding = { x: 20, y: 80 };
const dx = 100;
const dy = 50;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FlowComponent({ flowModel }: { flowModel: Models.FlowModel }) {
  const [tree, setTree] = React.useState<any>(null);
  const [svgWidth, setSvgWidth] = React.useState(0);
  const [svgHeight, setSvgHeight] = React.useState(0);
  const svgRef = React.useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 1280;
    const height = 720;

    // const tree = layout.hierarchy({
    //   size: [1, 1],
    //   children: [
    //     { size: [2, 4] },
    //     { size: [3, 1], children: [{ size: [4, 1] }] },
    //   ],
    // });

    // const root = d3.stratify()(flowModel.graph);
    const line = d3
      .line()
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    const layout = flextree()
      .nodeSize((node: any) => {
        // const deputy = node.children && node.children.find((item: ) => item.data.isDeputy)
        let [width, height] = [100, 50];
        return [width, height];
      })
      .spacing((nodeA: any, nodeB: any) => padding.x);

    console.log({
      method: 'root',
      children: flowModel.graph,
    });

    const tree = layout.hierarchy({
      method: 'root',
      children: flowModel.graph,
    });
    layout(tree);
    
    // root.x0 = 0;
    // root.y0 = width / 2;
    // root.descendants().forEach((d: any, i: number) => {
    //   d._children = d.children;
    // });
    const root = tree;

    const gLink = svg
      .append('g')
      .attr('transform', (d: any) => `translate(${width / 2},${20})`)
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5);

    const gNode = svg
      .append('g')
      .attr('transform', (d: any) => `translate(${width / 2},${20})`);

    function update(source: any) {
      const duration = 250;

      //   root.sort((a, b) => {
      //     return b.data.isDeputy - a.data.isDeputy
      //   })

      const nodes = root.descendants();
      const links = root.links();

      // Compute the new tree layout.
      layout(root);

      nodes.forEach((node: any) => {
        if (node.parent && node.data.isDeputy) {
          const id = node.id;
          node.parent.descendants().forEach((sib: any) => {
            if (sib.id !== id && sib !== node.parent) {
              sib.x -= dx / 2 + padding.x / 2;
            }
          });
        }

        node.x0 = node.x;
        node.y0 = node.y;
      });

      const transition = svg.transition().duration(duration);

      // Update the nodes…
      const node = gNode.selectAll('g').data(nodes);

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node
        .enter()
        .append('g')
        .attr('transform', (d: any) => {
          console.log(`entered node: ${d.data.method}`);
          return `translate(${source.x0 - dx / 2},${source.y0 - dy / 2})`;
        })
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .on('click', (d: any) => {
          d.children = d.children ? null : d._children;
          update(d);
        });

      nodeEnter
        .append('foreignObject')
        .attr('width', dx)
        .attr('height', dy)
        .append('xhtml:div')
        .attr('class', 'box')
        .style('width', `${dx}px`)
        .style('height', `${dy}px`)
        .html((d: any) => {
          console.log(d);
          return `<span>${d.data.method}</span>`;
        });

      // Transition nodes to their new position.
      const nodeUpdate = node
        .merge(nodeEnter)
        .transition(transition)
        .attr('transform', (d: any) => {
          console.log(`updated node: ${d.data.method}`);
          const isDeputy = d.data.isDeputy;
          let [x, y] = [d.x, d.y];
          if (isDeputy) {
            x = d.parent.x - dx / 2 - dx;
            y = y - dy / 2 - padding.y - dy / 2;
          } else {
            x = x - dx / 2;
            y = y - dy / 2;
          }
          return `translate(${x},${y})`;
        })
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1);

      // Transition exiting nodes to the parent's new position.
      const nodeExit = node
        .exit()
        .transition(transition)
        .remove()
        .attr('transform', (d: any) => {
          `translate(${source.x - dx / 2},${source.y - dy / 2})`;
        })
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);

      // Update the links…
      const link = gLink.selectAll('path').data(links, (d: any) => {
        d.target.id;
      });

      //   Enter any new links at the parent's previous position.
      const linkEnter = link
        .enter()
        .append('path')
        .attr('d', (d: any) => {
          const o = [
            {
              x: source.x0,
              y: source.y0,
            },
            {
              x: source.x0,
              y: source.y0,
            },
            {
              x: source.x0,
              y: source.y0,
            },
            {
              x: source.x0,
              y: source.y0,
            },
          ];

          return line(o);
        });

      // Transition links to their new position.
      link
        .merge(linkEnter)
        .transition(transition)
        .attr('d', (d: any) => {
          const isDeputy = d.target.data.isDeputy;
          const deputyX = d.source.x - dx / 2;
          const deputyY = d.target.y - dy / 2 - padding.y;

          const generalMiddleY = d.target.y - (padding.y + dy) / 2;
          const o = [
            {
              x: d.source.x,
              y: d.source.y + dy / 2,
            },
            {
              x: d.source.x,
              y: isDeputy ? deputyY : generalMiddleY,
            },
            {
              x: isDeputy ? deputyX : d.target.x,
              y: isDeputy ? deputyY : generalMiddleY,
            },
            {
              x: isDeputy ? deputyX : d.target.x,
              y: isDeputy ? deputyY : d.target.y - dy / 2,
            },
          ];

          return line(o);
        });

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition(transition)
        .remove()
        .attr('d', (d: any) => {
          const o = [
            {
              x: source.x,
              y: source.y,
            },
            {
              x: source.x,
              y: source.y,
            },
            {
              x: source.x,
              y: source.y,
            },
            {
              x: source.x,
              y: source.y,
            },
          ];

          return line(o);
        });
    }

    update(root);

    setSvgWidth(width);
    setSvgHeight(height);
  }, [flowModel]);

  return <svg ref={svgRef} width={svgWidth} height={svgHeight}></svg>;
}

export default FlowComponent;
