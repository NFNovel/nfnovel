/* eslint-disable @next/next/no-img-element */
import {
  Button,
  Drawer,
  FormGroup,
  InputGroup,
  NumericInput,
  Position,
} from "@blueprintjs/core";
import { useState } from "react";

function AuctionModal(props: any) {
  const [visible, setVisibility] = useState(false);

  const visibleOn = () => {
    setVisibility(true);
  };

  const visibleOff = () => {
    setVisibility(false);
  };

  //   const state: IDrawerExampleState = {
  //     autoFocus: true,
  //     canEscapeKeyClose: true,
  //     canOutsideClickClose: true,
  //     enforceFocus: true,
  //     hasBackdrop: true,
  //     isOpen: false,
  //     position: Position.RIGHT,
  //     size: undefined,
  //     usePortal: true,
  // };

  //   public state: NumericInputProps = {
  //     allowNumericCharactersOnly: true,
  //     buttonPosition: "right",
  //     disabled: false,
  //     fill: false,
  //     intent: Intent.NONE,
  //     large: false,
  //     majorStepSize: 10,
  //     max: 100,
  //     min: 0,
  //     minorStepSize: 0.1,
  //     selectAllOnFocus: false,
  //     selectAllOnIncrement: false,
  //     stepSize: 1,
  //     value: "",
  // };
  return (
    <>
      <Drawer
        isOpen={visible}
        title="Place your Bid for this Panel"
        icon="info-sign"
        position={Position.BOTTOM}
        canEscapeKeyClose={true}
        canOutsideClickClose={false}
        enforceFocus={true}
        autoFocus={true}
        onClose={visibleOff}
        usePortal={true}
        hasBackdrop={true}
      >
        <div className="flex flex-row">
          <img
            src={
              "https://gateway.pinata.cloud/ipfs/QmdHcSkrPw8D7MoxuZ2VZ8H6KYDvhVphVxy7rZyNAo8EHZ"
            }
            className="border border-indigo-600 h-80"
          />
          <div className="flex flex-wrap flex-col">
            <div className="p-5">Highest bid: 1.2 ETH</div>
            <div className="p-5">
              Highest bidder: 0x1aVF3F8sa4f5sa8d6wd46D5sd6
            </div>
            <div className="p-5 flex flex-wrap">
              <FormGroup
                className=""
                helperText=""
                inline={false}
                label="Place your bid:"
                labelFor="text-input"
                labelInfo="(required)"
              >
                <NumericInput
                  placeholder="Enter a number..."
                  majorStepSize={0.1}
                  min={0}
                  stepSize={0.1}
                  allowNumericCharactersOnly={true}
                />
              </FormGroup>
            </div>
            <Button
              className="p-5"
              text="Place Bid"
              onClick={() => {
                alert("bid placed");
              }}
            ></Button>
          </div>

          <div className="bg-red-400 p-10">Time remaining! 05:15:36</div>
        </div>
      </Drawer>
      <Button
        className="bp4-minimal p-10"
        text="Open modal"
        onClick={visibleOn}
      ></Button>
    </>
  );
}

export default AuctionModal;
