import type { BigNumber } from "ethers";

export type Page = {
  /**
   * format: ipfs://\<CID\>
   * - @note no trailing slash at the end
   */
  baseURI: string;
  isRevealed: boolean;
  pageNumber: BigNumber;
  panelTokenIds: BigNumber[];
};

type percentString = `{number}%`;

interface PanelRow {
  height: percentString;
  panelWidths: percentString[];
}

interface PageMetadata {
  pageNumber: number;
  panelRowsDisplay: PanelRow[];
}

/**
 * use flex box with:
 * - each row defining its height
 * - each panel in the row defining its width(s)
 * - where sum(rowWidths) == 100 && sum(row[i].panelWidths) == 100
 * 
 * with CSS grid
 * 
----
HTML
----

<div class="page-container">
  <div class="page">
    <div class="panel" id="panel-1">1</div>
    <div class="panel" id="panel-2">2</div>
    <div class="panel" id="panel-3">3</div>
    <div class="panel" id="panel-4">4</div>
    <div class="panel" id="panel-5">5</div>
  </div>
</div>

---
CSS
---

.page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
}
.page {
  display: grid;
  background-color: white;
  width: 50%;
  height: 100%;
  grid-gap: 5px;
  grid-template-areas: "panel-1 panel-2"
                       "panel-3 panel-3"
                       "panel-4 panel-4"
                       "panel-5 panel-5";
  grid-template-rows: 40% 20% 20% 20%;
  grid-template-columns: 40% 60%;
  align-items: stretch;
  justify-items: stretch;
}

.panel {
  background-color: green;
  text-align: center;
  color: white;
  font-size: 20px;
}

#panel-1 {
  background-color: red;
  grid-area: panel-1;
}

#panel-2 {
  grid-area: panel-2;
}

#panel-3 {
  background-color: blue;
  grid-row-start: panel-3;
  grid-row-end: panel-3;
  grid-column-start: panel-3;
  grid-column-end: panel-3;
}

#panel-4 {
  color: black;
  background-color: yellow;
  grid-row-start: panel-4;
  grid-row-end: panel-4;
  grid-column-start: panel-4;
  grid-column-end: panel-4;
}

#panel-5 {
  color: black;
  background-color: orange;
  grid-row-start: panel-5;
  grid-row-end: panel-5;
  grid-column-start: panel-5;
  grid-column-end: panel-5;
}

 */
