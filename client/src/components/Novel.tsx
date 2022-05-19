import Subheader from "./Subheader";
import PageList from "./PageList";

function Novel(props: any) {
  return (
    <>
      <Subheader
        title={props.title}
        author={props.author}
      />
      <PageList />
    </>
  );
}

export default Novel;
