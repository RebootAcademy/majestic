import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useQuery, useMutation } from "react-apollo-hooks";
import { space, color } from "styled-system";
import FileItem from "./file-item";
import WORKSPACE from "./query.gql";
import SET_SELECTED_FILE from "./set-selected-file.gql";
import { Workspace } from "../../server/api/workspace/workspace";
import { transform } from "./transformer";
import Summary from "./summary";
import { Summary as SummaryType } from "../../server/api/workspace/summary";
import RUN from "./run.gql";
import { Play } from "react-feather";
import Button from "../components/button";

const Container = styled.div`
  ${space};
  ${color};
  height: 100vh;
`;

interface WorkspaceResult {
  workspace: Workspace;
}

interface Props {
  selectedFile: string;
  summary: SummaryType;
  onSelectedFileChange: () => void;
}

export default function TestExplorer({
  selectedFile,
  onSelectedFileChange,
  summary
}: Props) {
  const {
    data: { workspace }
  } = useQuery<WorkspaceResult>(WORKSPACE);

  const items = workspace.files;
  const root = items[0];
  const tree = transform(root, items, undefined);
  const run = useMutation(RUN);

  const [expandedItems, setExpandedItems] = useState({});
  const handleFileToggle = (path: string, isExpanded: boolean) => {
    setExpandedItems({
      ...expandedItems,
      [path]: isExpanded
    });
  };

  const setSelectedFile = useMutation(SET_SELECTED_FILE);
  const handleFileSelection = (path: string) => {
    setSelectedFile({
      variables: {
        path
      }
    });
    onSelectedFileChange();
  };

  return (
    <Container p={2} bg="dark" color="text">
      <Button
        size="sm"
        onClick={() => {
          run();
        }}
      >
        <Play size={14} /> Run tests
      </Button>
      <Summary summary={summary} />
      <FileItem
        item={tree}
        selectedFile={selectedFile}
        setSelectedFile={handleFileSelection}
        expandedItems={expandedItems}
        isExpanded={expandedItems[tree.path]}
        onToggle={handleFileToggle}
      />
    </Container>
  );
}