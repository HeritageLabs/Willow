import { CornerDialog } from "evergreen-ui"
import React from "react"

export default function RequestDialog({ handleAddNumber }) {
    const [isShown, setIsShown] = React.useState(true)
    return (
      <React.Fragment>
        <CornerDialog
          title="🥳 Welcome to Willow App"
          isShown={isShown}
          confirmLabel="Add/Verify your number"
          hasClose={false}
          hasCancel={false}
          onConfirm={handleAddNumber}
        //   onCloseComplete={() => setIsShown(false)}
        >
        Enjoy our new feature. 
        Add your number to receive a token from us on successful planting of a tree.
        </CornerDialog>
        {/* <Button onClick={() => setIsShown(true)}>
          Show “Learn More” Corner Dialog
        </Button> */}
      </React.Fragment>
    )
  }