import React, { useEffect } from 'react';
import { Models } from '@marvin/discovery';
import { SchemaForm } from '@ascentcore/react-schema-form';
import {
  CustomWrapper,
  CustomRegistry,
} from '../components/custom.registry.schema.form';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  DialogActions,
  Button,
} from '@mui/material';

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
  return node.data.sequence_step;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FlowComponent({
  flowModel,
  config,
  saveFile,
}: {
  flowModel: Models.FlowModel;
  config: any;
  saveFile: Function;
}) {
  const [tree, setTree] = React.useState<any>(null);
  const [svgWidth, setSvgWidth] = React.useState(0);
  const [svgHeight, setSvgHeight] = React.useState(0);
  const svgRef = React.useRef(null);
  const [addFor, setAddFor] = React.useState<any | undefined>(undefined);
  const [action, setAction] = React.useState<string | undefined>(undefined);
  const [schema, setSchema] = React.useState<any>(undefined);

  const [hieararchy, setHierarchy] = React.useState<any>(null);

  const prepareActionForm = (action: string) => {
    setAction(action);
    const method = flowModel.actions[addFor.url].filter(
      (method) => method.method === action
    )[0];
    if (method) {
      const schema = {
        type: 'object',
        title: method.method,
        properties: {
          sequence_step: {
            type: 'string',
            title: 'Sequence Step',
          },
          parameters: {
            type: 'object',
            properties: method.sequence
              .filter((s: any) => s.type === 'fill')
              .reduce((memo: any, obj: any) => {
                memo[obj.locator] = { type: 'string', title: obj.locator };
                return memo;
              }, {}),
          },
        },
      };
      setSchema(schema);
    }
  };

  const submit = (data: any) => {
    const { url } = addFor;

    addFor.children = addFor.children || [];
    addFor.children.push({
      ...data,
      method: action,
      url,
    });

    saveFile('flow', { ...flowModel, graph: hieararchy.children });
  };

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
    const hier = {
      sequence_step: config.name,
      url: config.rootUrl + '/',
      children: flowModel.graph,
    };
    setHierarchy(hier);
    const tree = layout.hierarchy(hier);

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
      .append('path')
      .attr(
        'transform',
        (d: any) => `translate(${d.xSize / 2 - 10} ${d.ySize - 20})scale(0.8)`
      )
      .attr('d', () => 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z')
      .on('click', (e: any, d: any) => {
        setAddFor(d.data);
      });

    nodeEnter
      .append('text')
      .text((d: any) => getTitleFromNode(d))
      .style('font', font)
      .attr('x', (d: any) => d.xSize / 2)
      .attr('y', (d: any) => 17)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'hanging')
      .call(wrap, maxCellSize);

    var link = g.selectAll('path.link').data(links);

    const linkEnter = link
      .enter()
      .append('path')
      .attr('stroke', '#e2b862')
      .attr('d', (d: any) => {
        const { source, target } = d

        return `M${source.x} ${source.y + source.ySize} L${target.x} ${target.y}`
      });

    setSvgWidth(width);
    setSvgHeight(height);
  }, [flowModel]);

  return (
    <>
      <svg ref={svgRef} width={svgWidth} height={svgHeight}></svg>
      {addFor && (
        <Dialog open={addFor !== undefined} fullWidth={true} maxWidth="md">
          <DialogTitle>Title</DialogTitle>
          <DialogContent>
            <TextField
              label="Select Action"
              fullWidth={true}
              select
              value={action}
              onChange={(e) => prepareActionForm(e.target.value)}
            >
              {(flowModel.actions[addFor.url] || []).map((action) => (
                <MenuItem key={action.method} value={action.method}>
                  {action.method}
                </MenuItem>
              ))}
            </TextField>
            {schema && (
              <SchemaForm
                schema={schema}
                wrapper={CustomWrapper as any}
                config={{ registry: CustomRegistry }}
                onSubmit={submit}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setAction(undefined);
                setSchema(undefined);
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

export default FlowComponent;
