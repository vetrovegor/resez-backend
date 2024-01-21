import { Request, Response, NextFunction } from 'express';

import scoreConversionService from '../../services/education/scoreConversionService';
import { ScoreConversionDTO } from 'types/education';
import { RequestWithParams, RequestWithParamsAndBody, IdParam } from 'types/request';

class ScoreConversionController {
    async saveScoreConversion(req: RequestWithParamsAndBody<IdParam, ScoreConversionDTO>, res: Response, next: NextFunction) {
        try {
            await scoreConversionService.saveScoreConversion(req.params.id, req.body.scoreConversion);
    
            res.sendStatus(200);            
        } catch (error) {
            next(error);
        }
    }
    
    async getScoreConversion(req: RequestWithParams<IdParam>, res: Response, next: NextFunction) {
        try {
            const data = await scoreConversionService.getScoreConversion(req.params.id);
    
            res.json(data);            
        } catch (error) {
            next(error);
        }
    }
}

export default new ScoreConversionController();