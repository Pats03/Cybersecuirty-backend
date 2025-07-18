const Router = require('express'); // This is already correct, but you may want to use 'express' for routing, not mongoose.
const router = Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getQuiz, getAllQuizzes,createQuiz,updateQuiz ,getScore,updateScore,getScoresByJobRole,deleteQuiz} = require('../controller/quizController'); // Change from ES module import to CommonJS require
router.get('/quiz/:role', getQuiz);
router.get('/quiz', getAllQuizzes);
router.post('/quiz', createQuiz);
router.put('/quiz/:id', updateQuiz);
router.get('/my-score', authMiddleware,getScore);
router.post('/update-score', authMiddleware, updateScore);
router.get('/scores-by-jobrole', authMiddleware, getScoresByJobRole);
router.delete('/quiz/:id', deleteQuiz);
module.exports = router;
