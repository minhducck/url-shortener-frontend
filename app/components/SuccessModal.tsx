import {Dialog, DialogContent, type DialogProps, DialogTitle, Link, Slide} from "@mui/material";
import type {TransitionProps} from "@mui/material/transitions";
import {forwardRef} from "react";
import type {UrlOutputType} from "~/types/url-output.type";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const SuccessPopup = forwardRef(function SuccessPopup(
  props: DialogProps & {
    createdUrl: UrlOutputType
  },
  ref: React.Ref<HTMLDivElement | null>,
) {
  return (
    <Dialog
      {...props}
      slots={{
        transition: Transition,
      }}
      ref={ref}
    >
      <DialogTitle align={'center'}>Link Created!</DialogTitle>
      <DialogContent>
        <Box sx={{
          m: 2,
          p: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: '#2563eb',
          bgcolor: '#eef4ff',
          textAlign: 'center'
        }}>
          <Typography
            component={Link}
            align={'center'}
            color={'primary'}
            href={props.createdUrl.shorten_url}
            target={'_blank'}
          >{props.createdUrl.shorten_url}</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  )
});