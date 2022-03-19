import { Request, Response, Router } from "express";
import Course, { ICourse, PROPOSAL_STATUS, COURSE_STATUS } from "../models/Course"
import { IGetUserAuthInfoRequest } from "../middleware/auth";
import { getPermissions, ROLES } from "../models/Permissions";

const courseRouter = Router();

function search(search_term) {
    return Course.find(search_term).populate('professors');;
}

// this function is janky - should use a legit library
function strToBool(str: string): boolean {
    const test = str.trim().toLowerCase();
    return !((test === 'false') || (test === '0') || (test === ''));
}

// search courses
courseRouter.get("/search/:finalized", async (req: IGetUserAuthInfoRequest, res: Response) => {
    // if frontend wants to get only current courses, they have to pass back year in search term
    if (typeof req.params.finalized === 'undefined') {
        res.status(401).json({
            message: "specify whether you want finalized courses or all courses",
        });
    }
    let status_term;
    if (strToBool(req.params.finalized)) { 
        status_term = {proposal_status: PROPOSAL_STATUS.CCC_ACCEPTED};
    } else { // want proposed courses
        const permissions = getPermissions(req.user.role);
        if (permissions.can_review_undergrad_courses && permissions.can_review_graduate_courses) { // manager
            status_term = {proposal_status: {$ne: PROPOSAL_STATUS.CCC_ACCEPTED}};
        } else if (permissions.can_review_undergrad_courses) { // undergraduate reviewer or director
            status_term = {proposal_status: {$ne: PROPOSAL_STATUS.CCC_ACCEPTED}, is_undergrad: true};
        } else if (permissions.can_review_graduate_courses) { // graduate director
            status_term = {proposal_status: {$ne: PROPOSAL_STATUS.CCC_ACCEPTED}, is_undergrad: false};
        } else if (req.user.role == ROLES.PROFESSOR) { // give them their proposed courses only
            status_term = {proposal_status: {$ne: PROPOSAL_STATUS.CCC_ACCEPTED}, professor: req.user._id}
        }
    }

    // NEED TO DEAL WITH PARSING SEARCH PARAMS (perhaps express middleware)
    const search_term = JSON.parse(JSON.stringify(req.query));
    try {
        // status_term must come after search_term to make sure that if proposed_status is in search term, the updated value in status_term overwrites it
        const result = await search({ ...search_term, ...status_term}); 
        res.status(200).json({result});
    } catch (err) {
        console.log(err);
        res.status(401).json({
            message: "no course found with this search term",
        });
    }
    
});

function getCourseStatus(proposed_course, original_course) {
    if (!original_course) {
        return COURSE_STATUS.NEW;
    }
    if (original_course.course_title === proposed_course.course_title && 
        original_course.description === proposed_course.description &&  
        original_course.is_DIAP === proposed_course.is_DIAP &&  
        original_course.is_remote === proposed_course.is_remote &&  
        original_course.is_WRIT === proposed_course.is_WRIT) {
        return COURSE_STATUS.EXISTING;
    } else {
        return COURSE_STATUS.REVISED;
    }
};

// change this - only difference is that professors is string[], not IUser[]
interface ICourseSubmission {
    _id?: String, // assigned by MongoDB
    created_at?: Date,
    course_number: String,
    crn?: Number,
    course_title: String,
    description: String,
    professors: String[],
    // booleans
    is_undergrad: Boolean, // if false, then grad
    is_DIAP: Boolean,
    is_WRIT: Boolean,
    is_Premodern: Boolean,
    is_FYS: Boolean,
    is_SYS: Boolean,
    is_capstone: Boolean,
    is_lecture: Boolean,
    is_intro: Boolean,
    is_remote: Boolean,
    // enums
    semester: String,
    year: Number,
    final_time: String, // A,B... hour, so a string of this character
    time_ranking?: String[], // array of strings, e.g. [A, C, E]
    geography: String[], // has to be from geo_regions list
    proposal_status: String,
    course_status: String, // new, revised, or existing --> these are existing hist. dept. standards that we're replicating here
}

interface ICourseProposalRequest {
    original?: ICourse, // this is the course upon which the proposed course is based. Should pass back the full ICourse Object, including the populated professor IUser objects
    proposed: ICourseSubmission, // this will have professors as an array of strings, where each string is the professor's Object ID
}

// submit a course
courseRouter.post("/submit", async (req: IGetUserAuthInfoRequest, res: Response) => {
    const permissions = getPermissions(req.user.role);
    const proposalRequest = req.body as ICourseProposalRequest;
    const status = getCourseStatus(proposalRequest.proposed, proposalRequest.original);

    if (permissions.can_submit_courses) {
        const newCourse = await Course.create({
            ...proposalRequest.proposed, 
            proposal_status: PROPOSAL_STATUS.DIRECTOR_REVIEW, 
            course_status: status
        });
        res.status(200).json({newCourse});

        // TODO: notify relevant parties via email
    } else {
        res.status(401).json({
            message: "submission failed",
        });
    }
});

// NOT TO BE USED BY FRONTEND
courseRouter.get("/search-dev-only", async (req: IGetUserAuthInfoRequest, res: Response) => {
    // NEED TO DEAL WITH PARSING SEARCH PARAMS (perhaps express middleware)
    const search_term = JSON.parse(JSON.stringify(req.query));
    try {
        // status_term must come after search_term to make sure that if proposed_status is in search term, the updated value in status_term overwrites it
        const result = await search(search_term); 
        res.status(200).json({result});
    } catch (err) {
        console.log(err);
        res.status(401).json({
            message: "no course found with this search term",
        });
    }
});

// NOT TO BE USED BY FRONTEND
courseRouter.post("/submit-dev-only", async (req: IGetUserAuthInfoRequest, res: Response) => {
    const proposalRequest = req.body as ICourseSubmission;
    const newCourse = await Course.create({
        ...proposalRequest
    });
    res.status(200).json({newCourse});
});

courseRouter.post("/accept", async (req: IGetUserAuthInfoRequest, res: Response) => {
    const permissions = getPermissions(req.user.role);
    if (permissions.can_accept_reject_courses) {
        const course = req.body as ICourse;
        if (req.user.role == ROLES.UG_DIRECTOR && course.is_undergrad) {
            course.proposal_status = PROPOSAL_STATUS.DIRECTOR_ACCEPTED;
        } else if (req.user.role == ROLES.GRAD_DIRECTOR && !course.is_undergrad) {
            course.proposal_status = PROPOSAL_STATUS.DIRECTOR_ACCEPTED;
        } else if (req.user.role == ROLES.MANAGER) {
            course.proposal_status = PROPOSAL_STATUS.CCC_ACCEPTED;
        } else {
            res.status(401).json({
                message: "do not have permission to accept this specific course",
            });
        }
    } else {
        res.status(401).json({
            message: "do not have permission to accept courses"

        });
    }
});

courseRouter.post("/reject", async (req: IGetUserAuthInfoRequest, res: Response) => {
    const permissions = getPermissions(req.user.role);
    if (permissions.can_accept_reject_courses) {
        const course = req.body as ICourse;
        if (req.user.role == ROLES.UG_DIRECTOR && course.is_undergrad) {
            course.proposal_status = PROPOSAL_STATUS.DIRECTOR_REJECTED;
        } else if (req.user.role == ROLES.GRAD_DIRECTOR && !course.is_undergrad) {
            course.proposal_status = PROPOSAL_STATUS.DIRECTOR_REJECTED;
        } else if (req.user.role == ROLES.MANAGER) {
            course.proposal_status = PROPOSAL_STATUS.CCC_REJECTED;
        } else {
            res.status(401).json({
                message: "do not have permission to reject this specific course",
            });
        }
    } else {
        res.status(401).json({
            message: "do not have permission to reject courses"

        });
    }
});

export default courseRouter;
