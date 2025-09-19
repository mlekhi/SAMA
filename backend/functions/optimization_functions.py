from flask import request, jsonify
from models import db, Optimization
import logging

logger = logging.getLogger(__name__)

def save_optimization():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        
        # Check if record exists
        optimization = Optimization.query.get(user_id)
        if not optimization:
            optimization = Optimization(user_id=user_id)
            db.session.add(optimization)
        
        # Update fields
        optimization.MaxIt = data.get('maxIterations')
        optimization.nPop = data.get('populationSize')
        optimization.w = data.get('inertiaWeight')
        optimization.wdamp = data.get('inertiaWeightDamping')
        optimization.c1 = data.get('personalLearningCoeff')
        optimization.c2 = data.get('globalLearningCoeff')
        
        db.session.commit()
        return jsonify({'id': optimization.user_id, 'message': 'Optimization data saved successfully'}), 200
    except Exception as e:
        logger.error(f"Error saving optimization data: {str(e)}")
        return jsonify({'error': str(e)}), 500

def get_optimization():
    user_id = request.user['uid']
    opt = Optimization.query.get(user_id)
    if not opt:
        return jsonify({'error': 'No optimization data found'}), 404
    return jsonify({
        'MaxIt': opt.MaxIt,
        'nPop': opt.nPop,
        'w': opt.w,
        'wdamp': opt.wdamp,
        'c1': opt.c1,
        'c2': opt.c2
    })