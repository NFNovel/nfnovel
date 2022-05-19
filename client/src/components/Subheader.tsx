import Image from "next/image";

import SubheaderBanner from "./banner-images/subheader-banner.jpg";

function Subheader(props: any) {
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
          <div className="pt-2 pl-4">
            <h1 className="text-gray-300 text-3xl justify-center items-center flex">
              {props.title}
            </h1>
            <h5 className="text-gray-500 font-bold justify-center items-center flex">
              By: {props.author}
            </h5>
          </div>
        </div>
      </div>
    </>
  );
}

export default Subheader;
