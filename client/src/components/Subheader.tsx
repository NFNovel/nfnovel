import Image from "next/image";
import { useState } from "react";

import SubheaderBanner from "./banner-images/subheader-banner.jpg";

function Subheader(props: any) {
  const upArrow = "M165,0C74.019,0,0,74.019,0,165s74.019,165,165,165s165-74.019,165-165S255.981,0,165,0z M255.606,205.606  C252.678,208.535,248.839,210,245,210s-7.678-1.464-10.606-4.394l-69.396-69.393l-69.392,69.393c-5.857,5.858-15.355,5.858-21.213,0  c-5.858-5.857-5.858-15.355,0-21.213l79.998-80c2.813-2.813,6.628-4.394,10.606-4.394c3.979,0,7.793,1.58,10.607,4.394l80.002,80  C261.465,190.251,261.465,199.749,255.606,205.606z";
  const downArrow = "M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z";

  const [svgPath, setSvgPath] = useState(downArrow);
  const [expand, setExpand] = useState(false);

  function handleClick() {
    if (expand === false) {
      setSvgPath(upArrow);
      setExpand(true);
    } else {
      setSvgPath(downArrow);
      setExpand(false);
    }
  }

  return (
    <>
      <div
        className="h-40 bg-cover"
        style={{ backgroundImage: `url(${SubheaderBanner.src})` }}
      ></div>
      <div className="bg-nfnovels_dark">
        <div className="mx-4 relative flex justify-center items-center">
          <div className="flex-shrink-0 h-20 w-20 rounded-full overflow-hidden relative -top-3 border-4 border-white bg-white">
            {/* BUG: this <Image> is the source of Warning: Prop `style` did not match.
             tried commenting out everything one by one and this was the cause
            */}
            <Image
              src="/subheader-logo.png"
              width="100%"
              height="100%"
            />
          </div>
          <div className="pt-2 pl-4 text-center">
            <h1 className="text-gray-300 text-3xl flex">{props.title}</h1>
            <h5 className="text-gray-500 justify-center mr-20 font-bold flex">
              By: {props.author}
            </h5>
          </div>
        </div>

        {expand && (
          <div
            className={
              "text-2xl text-gray-300 ml-20 text-center mr-20 mt-10 mb-5"
            }
          >
            {props.summary}
          </div>
        )}

        <div className="justify-center items-center flex">
          <button
            onClick={() => handleClick()}
            className={"mb-3 text-nfnovels_text-darker hover:text-white"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 330 330"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d={svgPath}
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default Subheader;
