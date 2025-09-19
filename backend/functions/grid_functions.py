from flask import request, jsonify
from models import db, Grid
import json
import logging

logger = logging.getLogger(__name__)

def get_grid_config():
    user_id = request.user['uid']
    grid = Grid.query.get(user_id)
    if not grid:
        return jsonify({'error': 'No grid data found'}), 404
    return jsonify({
        'Grid': grid.Grid,
        'NEM': grid.NEM,
        'Annual_expenses': grid.Annual_expenses,
        'Grid_sale_tax_rate': grid.Grid_sale_tax_rate,
        'Grid_Tax_amount': grid.Grid_Tax_amount,
        'Grid_escalation_rate': grid.Grid_escalation_rate,
        'Grid_credit': grid.Grid_credit,
        'NEM_fee': grid.NEM_fee,
        'SC_flat': grid.SC_flat,
        'Pbuy_max': grid.Pbuy_max,
        'Psell_max': grid.Psell_max,
        'compensation_option': grid.compensation_option,
        'flat_compensation': grid.flat_compensation,
        'monthly_compensation': grid.monthly_compensation,
        'season': grid.season,
        'holidays': grid.holidays,
        'rateStructure': grid.rateStructure,
        'flatPrice': grid.flatPrice,
        'seasonalPrices': grid.seasonalPrices,
        'monthlyPrices': grid.monthlyPrices,
        'tieredPrices': grid.tieredPrices,
        'tierMax': grid.tierMax,
        'seasonalTieredPrices': grid.seasonalTieredPrices,
        'seasonalTierMax': grid.seasonalTierMax,
        'monthlyTieredPrices': grid.monthlyTieredPrices,
        'monthlyTierLimits': grid.monthlyTierLimits,
        'onPrice': grid.onPrice,
        'midPrice': grid.midPrice,
        'offPrice': grid.offPrice,
        'onHours': grid.onHours,
        'midHours': grid.midHours,
        'onPeakPrice': grid.onPeakPrice,
        'midPeakPrice': grid.midPeakPrice
    })

def save_grid():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        
        # Check if record exists
        grid = Grid.query.get(user_id)
        if not grid:
            grid = Grid(user_id=user_id)
            db.session.add(grid)
        
        # Update fields dynamically
        for key, value in data.items():
            if key in ['season', 'holidays']:
                # Store as JSON-encoded string
                setattr(grid, key, json.dumps(value))
            elif hasattr(grid, key):
                # Handle empty strings for nullable columns
                column = getattr(grid.__class__, key)
                if value == '' and column.nullable:
                    setattr(grid, key, None)
                else:
                    setattr(grid, key, value)
        
        db.session.commit()
        return jsonify({'id': grid.user_id, 'message': 'Grid data saved successfully'}), 200
    except Exception as e:
        logger.error(f"Error saving grid data: {str(e)}")
        return jsonify({'error': str(e)}), 500