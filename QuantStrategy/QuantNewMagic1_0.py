from QuantStrategy.QuantStrategy import QuantStrategy

class QuantNewMagic1_0(QuantStrategy):
    def __init__(self,parm) -> None:
        super().__init__(parm)
        

    def makeQuery(self):
        self.query = " \
        select b.\"ticker\" , b.\"name\" \
        from( \
            select a.\"ticker\"as \"ticker\" , a.\"name\"  as \"name\", a.\"Rank_PBR_Q\" + a.\"Rank_GPA\" as \"sum\" \
            from ( \
                select  c.\"ticker\"as \"ticker\" , c.\"name\"  as \"name\", rank () OVER(order by c.\"PBR_Q\" desc) as \"Rank_PBR_Q\", rank () over(order by c.\"GPA\" asc) as \"Rank_GPA\",c.\"GPA\" \
                from ( \
                    select cor.ticker as \"ticker\", cor.corp_name as \"name\", fin.\"PBR_Q\" as \"PBR_Q\", fin.\"operating_income_Q\"*10000/fin.\"total_assets_Q\" as \"GPA\" , fin.\"operating_income_Q\",fin.\"total_assets_Q\" \
                    from financial_statement fin, corporation cor \
                    where fin.\"ticker\"=cor.\"ticker\"   \
                    and fin.\"PBR_Q\" > '"+str(self.parm['data']['PBR_Q']['values'][0])+"' \
                    and fin.\"market_cap\" >= '"+str(self.parm['data']['market_cap']['values'][0])+"' \
                    ) c \
                ) a \
            ) b \
        order by b.\"sum\" desc \
        limit "+str(self.parm['numberOfData'])
        
        print(self.query)

        
