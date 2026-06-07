import type {Route} from "./+types/home";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  OutlinedInput,
  Stack,
  TextField,
} from "@mui/material";
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {useCallback, useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import type {UrlCreation} from "~/types/url-creation.dto";
import CustomizedAccordions from "~/components/CustomizedAccordions";
import {DesktopDateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {useUrlCreation} from "~/hooks/useUrlCreation";
import {SuccessPopup} from "~/components/SuccessModal";
import type {UrlOutputType} from "~/types/url-output.type";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {UrlItem} from "~/components/URLItem";

const schema = z.object({
  original_url: z.url({
    protocol: /^(http|https)$/,
  }).min(10).max(256),
  custom_url: z.preprocess(
    (v) => v === '' ? undefined : v,
    z.string().regex(/[a-zA-Z0-9\-_]+/).min(3).max(50).default('').optional()),
  password: z.preprocess(
    (v) => v === '' ? undefined : v, z.string().min(8).optional()),
  expiration_date: z.preprocess(
    (v) => v === '' ? undefined : v, z.iso.datetime().min(Date.now()).optional()),
});

export function meta({}: Route.MetaArgs) {
  return [
    {title: "Url Shortener"},
    {name: "description", content: "Shorten your URL!"},
  ];
}

export default function Home() {
  const [createdList, setCreatedList] = useState<UrlOutputType[]>([]);
  const {register, handleSubmit, formState: {errors}} = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });
  const {isProcessing, error, createShortenURL} = useUrlCreation();
  const [isGenerating,] = useState(isProcessing);

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdUrl, setCreatedURL] = useState<UrlOutputType | null>(null);

  const [isShowPassword, setIsShowPassword] = useState(false);

  const handleCloseSuccess = useCallback(() => {
    setShowSuccess(false);
  }, [setShowSuccess]);

  const handleGenerateUrl = useCallback(async (data: UrlCreation) => {
    const response = await createShortenURL(data);
    setCreatedURL(response);
    setShowSuccess(true);

    setCreatedList(prev => {
      return [...prev, response];
    });
  }, [createdList]);

  const handleDelete = useCallback((removed: UrlOutputType) => {
    setCreatedList((prev) => {
      return [...prev.filter((v) => v.shortcode !== removed.shortcode)];
    })
  }, [createdList])


  const replaceOldData = useCallback((oldData: UrlOutputType, newData: UrlOutputType) => {
    setCreatedList(prev => {
      return [...prev.map((v) => {
        if (v.shortcode === oldData.shortcode) {
          return newData;
        }
        return v;
      })];
    })

  }, [createdList, setCreatedList])

  return <Box>
    {showSuccess && createdUrl && <SuccessPopup
        open={showSuccess}
        maxWidth={'md'}
        createdUrl={createdUrl}
        onClose={handleCloseSuccess}
    />}
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
          URL Shortener
        </Typography>
      </Toolbar>
    </AppBar>

    <Container maxWidth={'md'}>
      <Stack spacing={2} direction="column">
        <Typography variant={'h3'} color={'textPrimary'} align={'center'}>Shorten your URL</Typography>
        <Box className={'form-container'} component={"form"} onSubmit={handleSubmit(handleGenerateUrl)}>
          <FormControl fullWidth={true}>
            <OutlinedInput
              placeholder={'Enter a long URL here.'}
              fullWidth={true}
              error={Boolean(errors.original_url)}
              startAdornment={<InputAdornment position="start"><InsertLinkIcon/></InputAdornment>}
              endAdornment={<InputAdornment position={"end"}>
                <Button
                  type={'submit'}
                  variant={'contained'}
                  disabled={isGenerating}
                  endIcon={isGenerating ? <CircularProgress size={20}/> : <ArrowForwardIosIcon/>}
                >{isGenerating ? 'Loading' : 'Short it'}</Button>
              </InputAdornment>}
              {...register('original_url')}
            />
            <FormHelperText
              error={true}>{(errors.original_url && errors.original_url.message) || error}</FormHelperText>
          </FormControl>

          <CustomizedAccordions title={'Advanced settings'}>
            <Stack spacing={1}>
              <FormControl className={'custom-url'}>
                <TextField variant={'outlined'}
                           error={Boolean(errors.custom_url)}
                           label={'Customized URL'}
                           {...register('custom_url')}
                />
                <FormHelperText>{errors.custom_url && errors.custom_url.message}</FormHelperText>
              </FormControl>

              <FormControl className={'password'} error={Boolean(errors.password)}>
                <InputLabel>Password to update</InputLabel>
                <OutlinedInput
                  endAdornment={<InputAdornment position={'end'}>
                    <IconButton onClick={() => setIsShowPassword(!isShowPassword)}
                                onTouchStart={() => setIsShowPassword(true)}
                                onTouchEnd={() => setIsShowPassword(false)}>
                      {isShowPassword ? <VisibilityIcon/> : <VisibilityOffIcon/>}
                    </IconButton>
                  </InputAdornment>}
                  type={isShowPassword ? 'text' : 'password'}
                  label={'Password to update'}
                  {...register('password')}
                />
                <FormHelperText>{errors.password && errors.password.message}</FormHelperText>
              </FormControl>

              <FormControl error={Boolean(errors.expiration_date)} className={'expiration-date'}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDateTimePicker defaultValue={null} label={'Expiration date'}
                                         minDateTime={dayjs().add(1, 'd').startOf('day')}/>
                  <FormHelperText>{errors.expiration_date && errors.expiration_date.message}</FormHelperText>
                </LocalizationProvider>
              </FormControl>
            </Stack>
          </CustomizedAccordions>
        </Box>
      </Stack>

      {/* Created Items }*/}
      <CustomizedAccordions title={'Created Items'}>
        <List>
          {createdList.map((urlModel) => <UrlItem
            key={urlModel.shortcode} urlItem={urlModel}
            onUpdate={(newData) => replaceOldData(urlModel, newData)}
            onDelete={(removed) => handleDelete(removed)}/>)}
        </List>
      </CustomizedAccordions>
    </Container>
  </Box>;
}
