import Link from "next/link";

import PageContent from "./PageContent";

function Page(pageData: any) {
  const pageId = pageData.pageId;
  const pageUrl = "/pages/";

  const pageLinkClass = () => {
    const linkClassName = "block border border-nfnovels_border bg-nfnovels_page-form p-2 rounded-md";
    if (pageData.clickable) {
      return (
        <div
          className={
            linkClassName + " hover:border-nfnovels_text cursor-pointer"
          }
        >
          <Link
            href={{ pathname: pageUrl, query: { pageId: pageId } }}
            passHref
          >
            <div className="flex relative">
              <PageContent {...pageData} />
            </div>
          </Link>
        </div>
      );
    } else {
      return (
        <div className="block border border-none bg-nfnovels_page-form rounded-md">
          <div className="flex relative">
            <PageContent {...pageData} />
          </div>
        </div>
      );
    }
  };

  return <div className="text-nfnovels_page_text pb-4">{pageLinkClass()}</div>;
}

export default Page;
