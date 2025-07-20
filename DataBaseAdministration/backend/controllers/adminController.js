import adminServices from "../services/adminServices.js";
const adminController = {
    login: async function(req, res){
        try{
            const {email , password} = req.body;
            const getAdmin = await adminServices.adminlogin(email ,password);
            if(getAdmin.success == true){
                res.status(200).json({
                    status: "SUCCESS",
                    data: getAdmin
                })
            }
            else{
                res.status(404).json({
                    status: "Failure",
                    warning: "WRONG PASSWORD"
                })
                console.log("Failure WIth login");
            }
        }catch(error){
            res.status(500).json({
                error: "Error During adminLogin"
            });
            console.error("Actual Error:", error); 
        }
    }
};
export default adminController;