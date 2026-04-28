import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from data_constants import EXTENDED_SKILL_MAPPING, SKILL_SYNONYMS

def dummy_tokenizer(doc):
    """Dummy tokenizer that just returns the input list of tokens"""
    return doc

class TfidfRecommender:
    def __init__(self):
        # We pass a list of tokens directly, so we use dummy functions
        self.vectorizer = TfidfVectorizer(
            analyzer='word',
            tokenizer=dummy_tokenizer,
            preprocessor=dummy_tokenizer,
            token_pattern=None
        )
        
        self.roles = list(EXTENDED_SKILL_MAPPING.keys())
        self.role_skills_list = []
        
        # Preprocess dataset
        for role in self.roles:
            skills = EXTENDED_SKILL_MAPPING[role]
            # Normalize skills to canonical form
            normalized_skills = [self.normalize_skill(s) for s in skills]
            # Remove duplicates while preserving order (optional, but good for tfidf)
            unique_skills = list(dict.fromkeys(normalized_skills))
            self.role_skills_list.append(unique_skills)
            
        # Fit vectorizer on the dataset
        self.tfidf_matrix = self.vectorizer.fit_transform(self.role_skills_list)
        self.feature_names = self.vectorizer.get_feature_names_out()

    def normalize_skill(self, skill):
        """Normalize a skill using synonyms to handle variations."""
        skill_lower = skill.lower().strip()
        
        if skill_lower in SKILL_SYNONYMS:
            return skill_lower
            
        for canonical, synonyms in SKILL_SYNONYMS.items():
            if skill_lower in synonyms:
                return canonical
                
        return skill_lower
        
    def recommend(self, user_skills, top_n=3):
        """Recommend careers based on user skills using TF-IDF and Cosine Similarity."""
        if not user_skills:
            return []
            
        # Preprocess user skills
        normalized_user_skills = [self.normalize_skill(s) for s in user_skills]
        # Remove duplicates
        unique_user_skills = list(dict.fromkeys(normalized_user_skills))
        
        # Vectorize user skills
        user_vector = self.vectorizer.transform([unique_user_skills])
        
        # Compute cosine similarity
        similarities = cosine_similarity(user_vector, self.tfidf_matrix)[0]
        
        # Rank the results
        top_indices = np.argsort(similarities)[::-1][:top_n]
        
        results = []
        for idx in top_indices:
            score = similarities[idx]
            match_percentage = min(max(int(score * 100), 10), 99) # ensure reasonable bounds
            
            # Boost exact match if score is perfectly 1.0
            if score > 0.99:
                match_percentage = 100
                
            results.append({
                'role': self.roles[idx],
                'matchScore': match_percentage,
                'similarity_score': float(score),
                'matched_skills_count': sum(1 for s in unique_user_skills if s in self.role_skills_list[idx]),
                'total_required_skills': len(self.role_skills_list[idx])
            })
            
        return results

    def get_role_skills(self, role):
        """Get the normalized required skills for a role"""
        try:
            idx = self.roles.index(role)
            return self.role_skills_list[idx]
        except ValueError:
            return []
