import styled from "styled-components";

const Box = styled.div`
  width: 100%;
  border: 1px solid black;
  border-radius: 10px;
  position: relative;

  margin-bottom: 1rem;

  .gb-title {
    position: absolute;
    font-weight: bold;
    padding: 0px 0.5rem 0px 0.5rem;
    margin-top: -0.75rem;
    margin-left: 0.75rem;
    background-color: white;
  }
`;

const ContentBox = styled.div`
  width: 100%;
  min-height: 5rem;
  padding: 0.7rem 1rem 0.7rem 1rem;
  box-sizing: border-box;
`;

const DefaultContent = () => {
  return (
    <p>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Atque quibusdam
      minima reiciendis modi corrupti numquam. Amet, perferendis cupiditate non
      consequatur quam facere? Quas saepe molestias consequuntur iusto quibusdam
      dolores vero, incidunt perferendis dicta odio provident nam qui debitis
      rerum voluptatibus ducimus velit optio alias, ut, cum accusamus! Inventore
      architecto quisquam ab? Sit eaque, tempora porro exercitationem fuga rerum
      eius quo officia, quis laudantium incidunt optio molestias delectus.
      Itaque quae quos consectetur, odit error possimus ad corrupti maiores
      voluptatibus modi a facilis fuga mollitia, cumque consequatur earum?
      Tenetur officia aperiam, aspernatur architecto velit ratione. Architecto
      quaerat neque iusto fugiat, velit aspernatur!
    </p>
  );
};

const GroupBox = ({ title = "GroupBox", children }) => {
  return (
    <Box>
      <span className="gb-title">{title}</span>
      <ContentBox>
        {!children ? <DefaultContent></DefaultContent> : children}
      </ContentBox>
    </Box>
  );
};

export default GroupBox;
