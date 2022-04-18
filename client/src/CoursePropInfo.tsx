import NavBar from './components/NavBar';
import { useEffect, useState } from "react";
import { IUser } from "../../server/src/models/User";
import { fetchUser } from "./utils/auth";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import { submitCourse } from './utils/courses';
import { ICourse } from '../../server/src/models/Course';
import {useLocation} from 'react-router'
import { json } from 'stream/consumers';


function CoursePropInfo() {

  const [user, setUser] = useState<IUser>();
  const [, setError] = useState("");
    // called once when components on page have rendered
    useEffect(() => {
        async function getUser() {
            await fetchUser(setUser, setError);
        }
        getUser();
        
    }, []);

    interface CustomizedState {
        course: any,
        approve: boolean,
        edit: boolean,
      }
      
    const location = useLocation();
    const state = location.state as CustomizedState; // Type Casting, then you can get the params passed via router
    const myState = state;

    const course = myState.course;
    const approve = myState.approve;
    const edit = myState.edit;
    
    console.log(course)

    const courseNumber = course["course_number"].split(" ")[1];
    const courseTitle = course["course_title"]
    const courseYear = course["year"]
    const courseDescription = course["description"]
    const courseSemester = course["semester"]
    var courseLevel = ""
    const courseGeography = course["geography"][0]

    if (course["is_undergrad"]) {
        courseLevel = "Undergraduate"
    } else {
        courseLevel = "Graduate"
    }


    // console.log(state);
    // console.log(state.edit);

    // if (state !== undefined && state !== null && state.constructor == Object) {

    // }

    // if (state instanceof json) {
    //     console.log(state)
    // }
    

    // console.log(props.location)
    // let id = props.location.state?.id;
    // console.log(id);

    // if (props.location.state.courseinfo) {
    //     console.log(props.location.state.course);
    // }

  // const [crn, setCrn] = useState(0);
  const [isUndergrad, setIsUndergrad] = useState(1);
  const [geography, setGeography] = useState('');
  const [description, setDescription] = useState('');
  const [capstone, setCapstone] = useState(false);
  const [fys, setFys] = useState(false);
  const [sys, setSys] = useState(false);
  const [intro, setIntro] = useState(false);
  const [lecture, setLecture] = useState(false);
  const [writ, setWrit] = useState(false);
  const [diap, setDiap] = useState(false);
  const [remote, setRemote] = useState(false);
  const [premodern, setPremodern] = useState(false);
  const [semester, setSemester] = useState('Fall');
  const [year, setYear] = useState(0);
  const [time, setTime] = useState('A');
  const [success, setSuccess] = useState(false);

  return (
    <div className="CourseProposal">

      <NavBar user = {user}/>
      <Box sx={{
            margin: 'auto', marginTop: 4, maxWidth:1060, paddingLeft: 0, border:0
          }}>
        <br/>
        <Box
            sx={{
            width: 500,
            height: 120,
            margin: 0,
            paddingLeft: 2,
          }}> 
            <Typography variant="h3" paddingBottom={5}>
                Course Proposal
            </Typography>
     
          </Box> 
      </Box>

      <Grid container spacing={2} maxWidth={1000} mx="auto">
              <Grid item xs={2}>
                <Typography variant="body1" fontWeight="bold" my="auto" align='right'>Course Number *</Typography>
              </Grid>
              <Grid item xs={0.5}>
              <Typography variant="body1" width="2">HIST</Typography>
              </Grid>
              <Grid item xs={9.5}>
              <TextField
                size='small'
                value = {courseNumber}
                InputProps={{
                    readOnly: true,
                  }}
              />
              </Grid>

              <Grid item xs={2}>
              <Typography variant="body1" fontWeight="bold" my="auto" align='right'>Course Title *</Typography>
              </Grid>
              <Grid item xs={10}>
              <TextField
                size='small'
                fullWidth
                value = {courseTitle}
                InputProps={{
                    readOnly: true,
                  }}
              />
              </Grid>
              
              <Grid item xs={2}>
              <Typography variant="body1" fontWeight="bold" my="auto" align='right'>Professor</Typography>
              </Grid>
              <Grid item xs={10}>
              <Typography variant="body1" my="auto">{user?.displayName}</Typography>
              </Grid>

              {/* <Grid item xs={2}>
              <Typography variant="body1" fontWeight="bold" my="auto" align='right'>CRN</Typography>
              </Grid>
              <Grid item xs={10}>
              <TextField
                size='small'
                onChange={(e)=>setCrn(parseInt(e.target.value))}
              />
              </Grid> */}

              <Grid item xs={2}>
              <Typography variant="body1" fontWeight="bold" my="auto" align='right'>Semester *</Typography>
              </Grid>
              <Grid item xs={10}>
              <TextField
                size='small'
                value = {courseSemester}
                InputProps={{
                    readOnly: true,
                  }}
                sx={{marginRight: 1}}
              >
                <MenuItem value={"Fall"}>Fall</MenuItem>
                <MenuItem value={"Winter"}>Winter</MenuItem>
                <MenuItem value={"Spring"}>Spring</MenuItem>
                <MenuItem value={"Summer"}>Summer</MenuItem>
              </TextField>
              <TextField
                InputProps={{
                    readOnly: true,
                  }}
                size='small'
                value = {courseYear}
                label="Year"
              />
              </Grid>

              <Grid item xs={2}>
              <Typography variant="body1" fontWeight="bold" my="auto" align='right'>Level *</Typography>
              </Grid>
              <Grid item xs={10}>
              <TextField
                size='small'
                InputProps={{
                    readOnly: true,
                  }}
                value = {courseLevel}
              >
                <MenuItem value={1}>Undergraduate</MenuItem>
                <MenuItem value={0}>Graduate</MenuItem>
              </TextField>
              </Grid>

              <Grid item xs={2}>
              <Typography variant="body1" fontWeight="bold" my="auto" align='right'>Geography</Typography>
              </Grid>
              <Grid item xs={10}>
              <TextField
                size='small'
                InputProps={{
                    readOnly: true,
                  }}
                value = {courseGeography}
                
              >
              </TextField>
              </Grid>

              <Grid item xs={2}>
              <Typography variant="body1" fontWeight="bold" my="auto" align='right'>Time *</Typography>
              </Grid>
              <Grid item xs={10}>
              <TextField
                size='small'
                InputProps={{
                    readOnly: true,
                  }}
                value = {course.final_time}
              >
              </TextField>
              </Grid>

              <Grid item xs={2}>
              <Typography variant="body1" fontWeight="bold" my="auto" align='right'>Course Description* </Typography>
              </Grid>
              <Grid item xs={10}>
              <TextField
              InputProps={{
                readOnly: true,
              }}
              fullWidth
                multiline={true}
                rows={5}
                value = {courseDescription}
              />
              <Typography variant="body2" mx="auto">* required fields </Typography>
              </Grid>

              <Grid item xs={3}></Grid>
              <Grid item xs={3}>
                <FormGroup>
                  <FormControlLabel control={<Checkbox disabled checked={course.is_capstone}/>} label="Capstone" />
                  <FormControlLabel control={<Checkbox disabled checked={course.is_FYS}/>} label="First-Year Seminar" />
                  <FormControlLabel control={<Checkbox disabled checked={course.is_SYS}/>} label="Sophomore Seminar" />
                  <FormControlLabel control={<Checkbox disabled checked={course.is_intro}/>} label="Intro" />
                  <FormControlLabel control={<Checkbox disabled checked={course.is_lecture}/>} label="Lecture" />
                </FormGroup>
              </Grid>
              <Grid item xs={3}>
                <FormGroup>
                    <FormControlLabel control={<Checkbox disabled checked={course.is_WRIT}/>} label="WRIT" />
                    <FormControlLabel control={<Checkbox disabled checked={course.is_DIAP}/>} label="DIAP" />
                    <FormControlLabel control={<Checkbox disabled checked={course.is_remote}/>} label="Remote" />
                    <FormControlLabel control={<Checkbox disabled checked={course.is_FYS}/>} label="Premodern" />
                </FormGroup>
              </Grid>
              <Grid item xs={3}></Grid>
              
            {approve&&<Grid item marginX="auto" >
              <Button 
                variant="contained" 
                sx={{textTransform:"none", backgroundColor:"#992525", mx:1}}
            >
                  <Typography gutterBottom variant="body1">
                    Accept
                  </Typography>
              </Button>
              <Button 
                variant="contained" 
                sx={{textTransform:"none", backgroundColor:"#992525", mx:1}}
                onClick={() => {
                  window.location.reload();
                }}>
                  <Typography gutterBottom variant="body1">
                    Reject
                  </Typography>
              </Button>
            </Grid>}

            {edit&&<Grid item marginX="auto" >
              <Button 
                variant="contained" 
                sx={{textTransform:"none", backgroundColor:"#992525", mx:1}}
            >
                  <Typography gutterBottom variant="body1">
                    Edit
                  </Typography>
              </Button>
            </Grid>}

          </Grid>

      

    </div>
  );
}

export default CoursePropInfo;
