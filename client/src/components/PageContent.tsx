function PageContent(pageData) {
  const mockData = {
    displayName: "Page 1",
    author: "@authorName",
    dateCreated: "2020-05-14T04:00:00Z",
    title: "Chapter title",
    panelIds: pageData.panelIds,
    summary: "Chapter summary here",
  };

  return (
    <div className="block">
      <h5 className="text-nfnovels_text-darker text-sm mb-1">
        Created by {mockData.author} {mockData.dateCreated}
      </h5>
      <h2 className="text-nfnovels_text text-2xl mb-3">{mockData.title}</h2>
      <div className="text-nfnovels_text text-sm leading-6">
        {mockData.summary}
      </div>
    </div>
  );
}

export default PageContent;
