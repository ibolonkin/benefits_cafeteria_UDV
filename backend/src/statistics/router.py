from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from io import BytesIO
import pandas as pd
from openpyxl.workbook import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows

from .handler import get_all, gather_data, static_info_get
from ..utils import get_superUser_payload

router = APIRouter(prefix="/statistics", tags=["Admin: Statistics"], )


@router.get('/static_info/')
async def static_info(info=Depends(static_info_get)):
    return info


@router.get('/')
async def root(stat=Depends(get_all)):
    return stat


def generate_excel(data):
    # Создаем DataFrame
    df = pd.DataFrame(data)

    wb = Workbook()
    ws = wb.active
    ws.title = "Statistics"

    if not df.empty:
        for row in dataframe_to_rows(df, index=False, header=True):
            ws.append(row)

        # Автофильтр для всех данных
        ws.auto_filter.ref = ws.dimensions

        # Настройка ширины столбцов
        for col in ws.columns:
            max_length = 0
            column = col[0].column_letter  # Буква столбца
            for cell in col:
                try:
                    if cell.value:
                        # Настраиваем ширину для столбца "Дата"
                        if col[0].value == "Дата" and isinstance(cell.value, pd.Timestamp):
                            cell.value = cell.value.strftime('%Y-%m-%d %H:%M:%S')
                        max_length = max(max_length, len(str(cell.value)))
                except Exception as e:
                    pass
            adjusted_width = (max_length + 5)
            ws.column_dimensions[column].width = adjusted_width
    else:
        ws.append(("За такую дату статистики нет",))

    # Сохраняем в поток
    excel_stream = BytesIO()
    wb.save(excel_stream)
    excel_stream.seek(0)

    return excel_stream


@router.get("/excel/")
async def get_statistics_excel(data=Depends(gather_data)):
    excel_file = generate_excel(data['stat'])

    return StreamingResponse(excel_file, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                             headers={"Content-Disposition": f"attachment; filename={data['name']}.xlsx"})

# TODO:
#  так же сделать блокировку и отлючение у юзера его льгоТ
#  и начать делать статтистику


# TODO: смена пароля
