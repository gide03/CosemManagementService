import { useContext, useEffect, useState } from "react";
import { WorkItemPresentationContext } from "../Context/WorkitemContext";
import GroupBox from "./GroupBox";
import styled from "styled-components";

const ContentWrapper = styled.div`
  width: 70%;
  height: 100%;
  padding: 1rem;
  box-sizing: border-box;

  overflow: hidden scroll;

  table {
    font-size: smaller;
  }

  th {
    text-align: left;
  }
`;

const ObjectInformation = () => {
  const { workItem } = useContext(WorkItemPresentationContext);
  if (workItem == null) {
    return <></>;
  }

  return (
    <table>
      <tbody>
        <tr>
          <th>Object Name</th>
          <td>{workItem.objectName}</td>
        </tr>
        <tr>
          <th>Logical Name</th>
          <td>{workItem.logicalName}</td>
        </tr>
        <tr>
          <th>Class ID</th>
          <td>{workItem.classId}</td>
        </tr>
        <tr>
          <th>Comment</th>
          <td>{workItem.comment}</td>
        </tr>
      </tbody>
    </table>
  );
};

const AttributeInformation = () => {
  const { workItem, activeNode, activeNodeTreeId } = useContext(
    WorkItemPresentationContext
  );
  const AccessRights = () => {
    const rootNodeId = parseInt(activeNodeTreeId[0]);
    const accessRights = workItem.accessRight;
    const clientList = Object.keys(accessRights);
    const clientAccessRight = clientList.map((clientElement) => {
      return accessRights[clientElement]["attribute"][rootNodeId - 1];
    });

    console.debug("Access Rights UI");
    console.debug(rootNodeId);
    console.debug(accessRights);
    console.debug(clientAccessRight);

    return (
      <table>
        <tbody>
          {clientList.map((acElement, idx) => {
            return (
              <tr key={`row-${acElement}-ac`}>
                <th>{acElement}</th>
                <td>{clientAccessRight[idx]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <table>
      <tbody>
        <tr>
          <th>Attribute name</th>
          <td>{activeNode.title}</td>
        </tr>
        <tr>
          <th>Comment</th>
          <td>
            <textarea></textarea>
          </td>
        </tr>
        <tr>
          <th>Access Rights</th>
          <td>
            <AccessRights></AccessRights>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const AttributePresentation = () => {
  const mContext = useContext(WorkItemPresentationContext);
  const activeNode = mContext.activeNode;
  const [defaultValue, setDefaultValue] = useState(activeNode.defaultValue);
  const [minValue, setMinValue] = useState(activeNode.minValue);
  const [maxValue, setMaxValue] = useState(activeNode.maxValue);
  const [accessRight, setAccessRight] = useState(activeNode.accessRight);
  const [modifier, setModifier] = useState(activeNode.modifier);

  useEffect(() => {
    setDefaultValue(activeNode.defaultValue);
    setMinValue(activeNode.minValue);
    setMaxValue(activeNode.maxValue);
    setAccessRight(activeNode.accessRight);
    setModifier(activeNode.modifier);
  }, [mContext.activeNode]);

  return (
    <ContentWrapper>
      <GroupBox title="Object Information">
        <ObjectInformation></ObjectInformation>
      </GroupBox>
      <GroupBox title="Attribute Information">
        <AttributeInformation></AttributeInformation>
      </GroupBox>
      <GroupBox title="Details"></GroupBox>
    </ContentWrapper>
  );
};

export default AttributePresentation;
