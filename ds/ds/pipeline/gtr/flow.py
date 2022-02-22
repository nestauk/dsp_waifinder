"""
Flow to get AI data from Gateway to Research SQL database
"""
from metaflow import FlowSpec, JSONType, current, project, step, Parameter
from ds.pipeline.gtr.utils import gtr_ai_tags
from ds import config

@project(name="ai_map")
class GtR_AI(FlowSpec):
    """
    We query the Gateway to Research database to find institutions
    which create AI research in decent proportions.
    Attributes:
        min_ai_prop: minimum proportion of AI for institution
        
    """

    min_ai_prop = Parameter(
        "min-ai-prop", help="minimum proportion of AI for institution", default=0.2
    )

    test_mode = Parameter(
        "test-mode",
        help="Run in test mode",
        default=True,
    )

    @step
    def start(self):
        """Start flow"""

        self.next(self.get_ai_orgs)

    @step
    def get_ai_orgs(self):
        """Get the orgs which have AI tagged projects"""
        

        # if self.test_mode is True and not current.is_production:
        #     self.sectors_corpora = dict(take(2, all_sectors_corpora.items()))
        # else:
        #     self.sectors_corpora = all_sectors_corpora

        self.ai_orgs = {'google': 22, 'uni of cambridge': 44}
        self.next(self.get_ai_props)

    @step
    def get_ai_props(self):
        """For each AI org find out proportion of topics in AI"""

        self.ai_orgs_all_topics = {'google': 100, 'uni of cambridge': 100}
        self.ai_orgs_prop_ai = {k:v/self.ai_orgs_all_topics[k] for k,v in self.ai_orgs.items()}

        self.next(self.filter_ai_orgs)

    @step
    def filter_ai_orgs(self):
        """Filter the AI orgs to just include those with higher
        proportions of AI tags"""

        
        self.ai_orgs_filtered = {k:v for k,v in self.ai_orgs_prop_ai.items() if v>= self.min_ai_prop}
        self.next(self.end)

    @step
    def end(self):
        """End flow"""
        pass

if __name__ == "__main__":
    GtR_AI()
