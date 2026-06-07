import {forwardRef, useCallback, useRef, useState} from "react";
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  ListItem,
  type ListItemProps,
  Snackbar,
  Stack
} from "@mui/material";
import type {UrlOutputType} from "~/types/url-output.type";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import type {UrlCreation} from "~/types/url-creation.dto";
import {useUrlUpdate} from "~/hooks/useUrlUpdate";
import {DesktopDateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {useUrlDelete} from "~/hooks/useUrlDelete";

const schema = z.object({
  original_url: z.url({
    protocol: /^(http|https)$/,
  }).min(10).max(256),
  custom_url: z.preprocess(
    (v) => v === '' || v === null ? undefined : v,
    z.string().regex(/[a-zA-Z0-9\-_]+/).min(3).max(50).default('').optional()),
  password: z.preprocess(
    (v) => v === '' ? undefined : v, z.string().min(8).optional()),
  expiration_date: z.preprocess(
    (v) => v === '' || v === null ? undefined : v, z.iso.datetime().min(Date.now()).optional()),
});

const ErrorSnackbar = ({message, open}: { message: string | null; open: boolean }) => {
  return <Snackbar open={open} autoHideDuration={3000}>
    <Alert
      severity="error"
      variant="filled"
      sx={{width: '100%'}}
    >
      {message}
    </Alert>
  </Snackbar>
}


const SuccessSnackbar = ({message, open}: { message: null | string; open: boolean }) => {
  return <Snackbar open={open}>
    <Alert
      severity="success"
      variant="filled"
      sx={{width: '100%'}}
    >
      {message}
    </Alert>
  </Snackbar>
}

export const UrlItem = forwardRef(function UrlItem(
  props: ListItemProps & {
    urlItem: UrlOutputType
    onDelete?: (removed: UrlOutputType) => any,
    onUpdate?: (newData: UrlOutputType) => any,
  },
  ref: React.Ref<HTMLLIElement | null>,
) {
  const [readonly, setReadonly] = useState(true);
  const {register, handleSubmit, formState: {errors}} = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    values: props.urlItem
  });

  const {isProcessing, updateURL, error} = useUrlUpdate(props.urlItem.shortcode);
  const {deleteURL, error: deleteUrlError} = useUrlDelete(props.urlItem.shortcode, props.urlItem.password);
  const formRef = useRef<HTMLFormElement>(null);

  const [successMsg, setSuccessMsg] = useState<null | string>(null);

  const handleUpdate = useCallback(async (data: UrlCreation) => {
    const response = await updateURL(data);
    setSuccessMsg(`Update Item ${props.urlItem.shortcode} successfully.`);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);
    props.onUpdate && props.onUpdate(response);
  }, [])

  const handleDelete = useCallback(async () => {
    await deleteURL();
    props.onDelete && props.onDelete(props.urlItem)
    return true;
  }, [deleteURL])

  const handleUpdateClick = useCallback(() => {
    if (readonly) {
      setReadonly(false);
    } else {
      // Call API to update
      setReadonly(true);
    }
  }, [readonly, formRef])

  return (
    <ListItem
      {...props}
      ref={ref}
    >
      <ErrorSnackbar message={error || deleteUrlError || null} open={Boolean(error || deleteUrlError)}/>
      <SuccessSnackbar open={Boolean(successMsg)} message={successMsg || null}/>
      <form onSubmit={handleSubmit(handleUpdate)} method={'POST'}>
        <Stack spacing={3}>
          <FormControl fullWidth={true}>
            <InputLabel>Custom URL</InputLabel>
            <Input {...register('custom_url')} disabled={readonly}/>
            <FormHelperText>{errors.custom_url && errors.custom_url.message}</FormHelperText>

          </FormControl>
          <FormControl fullWidth={true}>
            <InputLabel>Original URL</InputLabel>
            <Input {...register('original_url')} disabled={readonly}/>
            <FormHelperText>{errors.original_url && errors.original_url.message}</FormHelperText>
          </FormControl>

          <FormControl fullWidth={true}>
            <InputLabel>Password To update</InputLabel>
            <Input {...register('password')} disabled={readonly}/>
          </FormControl>
          <FormControl error={Boolean(errors.expiration_date)} className={'expiration-date'} disabled={readonly}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDateTimePicker defaultValue={null} label={'Expiration date'}
                                     minDateTime={dayjs().add(1, 'd').startOf('day')}
                                     disabled={readonly}
              />
              <FormHelperText>{errors.expiration_date && errors.expiration_date.message}</FormHelperText>
            </LocalizationProvider>
          </FormControl>

          <Stack spacing={2} direction={'row'}>
            <Button onClick={handleUpdateClick}>Enable Edit</Button>
            <Button type={'submit'} onClick={handleSubmit(handleUpdate)}>Save</Button>
            <Button color={'error'} onClick={handleDelete}>Delete</Button>
          </Stack>
        </Stack>
      </form>

    </ListItem>
  )
});