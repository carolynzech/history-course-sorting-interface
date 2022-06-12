import { ICourse } from '../../../server/src/models/Course';

// fetches the user if the user is logged in on the backend

export async function fetchCourses(
    setCourses: (courses: ICourse[]) => void,
    params: any,
    finalized: boolean
  ) {
    //   console.log(params);
    try {
        if (params == null){
            const res = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/courses/search/${finalized}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": "true",
                    },
                }
            );
            if (res.status === 200) {
                const resJson = await res.json();
                setCourses(resJson.result);
            } else {
                throw new Error("ONE Failed to fetch courses");
            }
        } else{
            var url = new URL(`${process.env.REACT_APP_SERVER_URL}/courses/search/${finalized}`)
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
            // console.log(url)
            const res = await fetch(url.toString(), 
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": "true",
                    },
                }
            );
            if (res.status === 200) {
                const resJson = await res.json();
                // console.log(res)
                setCourses(resJson.result);
            } else {
                throw new Error("TWO Failed to fetch courses");
            }
        }
        
        // if the user is logged in, set the user and authenticated flag
        
        
    } catch (error) {
        console.log(error);
        throw new Error("THREE Failed to fetch courses");
    }
  }

  export async function submitCourse(course_info: any) {
    try {
        const res = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/courses/submit`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(course_info),   
            }
        );
        console.log(res.status);

        // if the user is logged in, set the user and authenticated flag
        if (res.status === 200) {
            console.log("submitting course succeeded")
            return true;
        } else {
            throw new Error("failed to submit course");
        }
    } catch (error) {
        return false;
    }
  }

  export async function editCourse(course_info: any) {
    try {
        const res = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/courses/edit`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(course_info),   
            }
        );
        console.log(res.status);
        var message = await res.json();
        console.log(message);
        console.log(course_info);


        // if the user is logged in, set the user and authenticated flag
        if (res.status === 200) {
            console.log("editing course succeeded")
            return true;
        } else {
            throw new Error("failed to edit course");
        }
    } catch (error) {
        return false;
    }
  }



  
    export async function acceptRejectCourse(
        course_info: any,
        is_accept: boolean,
    ) {
    try {
        const url = new URL(`${process.env.REACT_APP_SERVER_URL}/courses/accept-reject/${is_accept}`)
        const res = await fetch(url.toString(), {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(course_info),   
        }
        );
            // console.log(res.status);

            // if the user is logged in, set the user and authenticated flag
            if (res.status === 200) {
                console.log("accepting/rejected succeeded!")
                return true;
            } else {
                throw new Error("failed to accept/reject course");
            }
        } catch (error) {
        return false;
        }
  }