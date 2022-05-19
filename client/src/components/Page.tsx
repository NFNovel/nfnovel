import { ethers } from "ethers";

function Page(props: any) {
  const pageData = props.pageData;

  const parsedPageData = {
    isRevealed: pageData.isRevealed,
    baseURI: pageData.baseURI,
    pageNumber: pageData.pageNumber.toNumber(),
    panelTokenIds: pageData.panelTokenIds,
  };

  function toggleAuthModal(event) {
    console.log(event);
  }

  const posts = [
    {
      img: "https://cdn.cnn.com/cnnnext/dam/assets/220114164903-spider-man-comic-book-auction-full-169.jpg",
    },
    {
      img: "https://preview.redd.it/4rtq2979tvm71.gif?width=640&crop=smart&format=png8&s=a80ed59a9329c930f288bfed57f96f31534bd340",
    },
    {
      img: "https://i.pinimg.com/originals/82/25/db/8225db331e7788cf6c02f7cbd7dec762.jpg",
    },
    {
      img: "https://i0.wp.com/aiptcomics.com/wp-content/uploads/2020/06/zabufeat.jpg",
    },
  ];

  return (
    <section className="mt-12 relative overflow-hidden py-28 px-4 border border-gray-900 sm:px-8">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((items, key) => (
          <article
            className="max-w-md mx-auto mt-4 bg-blue-800 shadow-lg border rounded-md duration-300 hover:shadow-sm"
            key={key}
            onClick={(e) => toggleAuthModal(key)}
          >
            <div className="filter opacity-100 hover:opacity-50 hover:red-500 duration-1000">
              <img
                src={items.img}
                className="w-full h-48 rounded-t-md"
              />
            </div>
          </article>
        ))}
      </div>
      <div className={"flex justify-center mt-10 text-3xl"}>
        Page: {parsedPageData.pageNumber}
      </div>
    </section>
  );
}

export default Page;
